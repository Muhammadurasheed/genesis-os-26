/**
 * Enterprise Circuit Breaker Service - FAANG Level Implementation
 * Prevents cascade failures and provides resilient service communication
 */

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
  halfOpenMaxCalls: number;
  slowCallThreshold: number;
  slowCallDurationThreshold: number;
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  slowCallCount: number;
  successCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  nextRetryTime: number;
  callHistory: CallResult[];
}

interface CallResult {
  timestamp: number;
  success: boolean;
  duration: number;
  error?: string;
}

interface CircuitBreakerResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  circuitState: string;
  executionTime: number;
}

export class CircuitBreakerService {
  private circuits: Map<string, CircuitBreakerState> = new Map();
  private configs: Map<string, CircuitBreakerConfig> = new Map();
  private metrics: Map<string, any> = new Map();

  constructor() {
    // Start monitoring and cleanup tasks
    this.startMonitoring();
  }

  /**
   * Register a circuit breaker for a service
   */
  registerCircuit(
    serviceId: string, 
    config: Partial<CircuitBreakerConfig> = {}
  ): void {
    const defaultConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringWindow: 120000, // 2 minutes
      halfOpenMaxCalls: 3,
      slowCallThreshold: 50, // 50% slow calls to trip
      slowCallDurationThreshold: 5000 // 5 seconds
    };

    this.configs.set(serviceId, { ...defaultConfig, ...config });
    
    if (!this.circuits.has(serviceId)) {
      this.circuits.set(serviceId, {
        state: 'CLOSED',
        failureCount: 0,
        slowCallCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        lastSuccessTime: 0,
        nextRetryTime: 0,
        callHistory: []
      });
    }

    console.log(`🛡️ Circuit breaker registered for ${serviceId}`);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    serviceId: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();
    
    // Ensure circuit is registered
    if (!this.circuits.has(serviceId)) {
      this.registerCircuit(serviceId);
    }

    const state = this.circuits.get(serviceId)!;
    const config = this.configs.get(serviceId)!;

    // Check if circuit should be opened/closed
    this.updateCircuitState(serviceId);

    // If circuit is open, return cached response or fallback
    if (state.state === 'OPEN') {
      const error = 'Circuit breaker is OPEN - service unavailable';
      
      if (fallback) {
        try {
          const fallbackResult = await fallback();
          return {
            success: true,
            data: fallbackResult,
            circuitState: 'OPEN_FALLBACK',
            executionTime: Date.now() - startTime
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: `Circuit OPEN and fallback failed: ${fallbackError}`,
            circuitState: 'OPEN_FALLBACK_FAILED',
            executionTime: Date.now() - startTime
          };
        }
      }

      this.recordMetric(serviceId, 'circuit_open_rejections');
      return {
        success: false,
        error,
        circuitState: 'OPEN',
        executionTime: Date.now() - startTime
      };
    }

    // If half-open, limit concurrent calls
    if (state.state === 'HALF_OPEN' && state.successCount >= config.halfOpenMaxCalls) {
      return {
        success: false,
        error: 'Circuit breaker is HALF_OPEN - max calls exceeded',
        circuitState: 'HALF_OPEN_LIMITED',
        executionTime: Date.now() - startTime
      };
    }

    // Execute the operation
    try {
      const result = await operation();
      const executionTime = Date.now() - startTime;
      
      // Record successful call
      this.recordCall(serviceId, {
        timestamp: Date.now(),
        success: true,
        duration: executionTime
      });

      // Update success metrics
      state.successCount++;
      state.lastSuccessTime = Date.now();

      // If half-open and successful, consider closing
      if (state.state === 'HALF_OPEN' && state.successCount >= config.halfOpenMaxCalls) {
        state.state = 'CLOSED';
        state.failureCount = 0;
        state.slowCallCount = 0;
        console.log(`✅ Circuit breaker for ${serviceId} moved to CLOSED`);
      }

      this.recordMetric(serviceId, 'successful_calls');
      return {
        success: true,
        data: result,
        circuitState: state.state,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Record failed call
      this.recordCall(serviceId, {
        timestamp: Date.now(),
        success: false,
        duration: executionTime,
        error: errorMessage
      });

      // Update failure metrics
      state.failureCount++;
      state.lastFailureTime = Date.now();

      // If half-open and failed, reopen circuit
      if (state.state === 'HALF_OPEN') {
        state.state = 'OPEN';
        state.nextRetryTime = Date.now() + config.recoveryTimeout;
        console.log(`🚨 Circuit breaker for ${serviceId} reopened due to failure in HALF_OPEN`);
      }

      this.recordMetric(serviceId, 'failed_calls');

      // Try fallback if available
      if (fallback) {
        try {
          const fallbackResult = await fallback();
          return {
            success: true,
            data: fallbackResult,
            circuitState: `${state.state}_FALLBACK`,
            executionTime: Date.now() - startTime
          };
        } catch (fallbackError) {
          console.error(`Fallback failed for ${serviceId}:`, fallbackError);
        }
      }

      return {
        success: false,
        error: errorMessage,
        circuitState: state.state,
        executionTime
      };
    }
  }

  /**
   * Update circuit state based on current metrics
   */
  private updateCircuitState(serviceId: string): void {
    const state = this.circuits.get(serviceId)!;
    const config = this.configs.get(serviceId)!;
    const now = Date.now();

    // Clean old call history
    state.callHistory = state.callHistory.filter(
      call => now - call.timestamp < config.monitoringWindow
    );

    // Check if open circuit should move to half-open
    if (state.state === 'OPEN' && now >= state.nextRetryTime) {
      state.state = 'HALF_OPEN';
      state.successCount = 0;
      console.log(`🔄 Circuit breaker for ${serviceId} moved to HALF_OPEN`);
      return;
    }

    // Check if closed circuit should open
    if (state.state === 'CLOSED') {
      const recentCalls = state.callHistory.filter(
        call => now - call.timestamp < config.monitoringWindow
      );

      if (recentCalls.length >= config.failureThreshold) {
        const slowCallRate = recentCalls.filter(
          call => call.duration > config.slowCallDurationThreshold
        ).length / recentCalls.length;

        // Check failure threshold
        if (state.failureCount >= config.failureThreshold) {
          state.state = 'OPEN';
          state.nextRetryTime = now + config.recoveryTimeout;
          console.log(`🚨 Circuit breaker for ${serviceId} opened due to failures (${state.failureCount}/${config.failureThreshold})`);
          return;
        }

        // Check slow call threshold
        if (slowCallRate >= (config.slowCallThreshold / 100)) {
          state.state = 'OPEN';
          state.nextRetryTime = now + config.recoveryTimeout;
          console.log(`🚨 Circuit breaker for ${serviceId} opened due to slow calls (${(slowCallRate * 100).toFixed(1)}%)`);
          return;
        }
      }
    }
  }

  /**
   * Record a call result
   */
  private recordCall(serviceId: string, call: CallResult): void {
    const state = this.circuits.get(serviceId)!;
    state.callHistory.push(call);

    // Keep only recent calls
    const config = this.configs.get(serviceId)!;
    const cutoff = Date.now() - config.monitoringWindow;
    state.callHistory = state.callHistory.filter(c => c.timestamp > cutoff);
  }

  /**
   * Record metrics for monitoring
   */
  private recordMetric(serviceId: string, metricName: string): void {
    const key = `${serviceId}:${metricName}`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  /**
   * Get circuit breaker status
   */
  getStatus(serviceId: string): {
    state: string;
    failureCount: number;
    successCount: number;
    config: CircuitBreakerConfig;
    recentCalls: CallResult[];
    metrics: Record<string, number>;
  } | null {
    const state = this.circuits.get(serviceId);
    const config = this.configs.get(serviceId);

    if (!state || !config) {
      return null;
    }

    const serviceMetrics: Record<string, number> = {};
    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith(`${serviceId}:`)) {
        const metricName = key.split(':')[1];
        serviceMetrics[metricName] = value;
      }
    }

    return {
      state: state.state,
      failureCount: state.failureCount,
      successCount: state.successCount,
      config,
      recentCalls: state.callHistory.slice(-10), // Last 10 calls
      metrics: serviceMetrics
    };
  }

  /**
   * Get all circuit statuses
   */
  getAllStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};
    
    for (const serviceName of this.circuits.keys()) {
      statuses[serviceName] = this.getStatus(serviceName);
    }

    return statuses;
  }

  /**
   * Reset circuit breaker
   */
  reset(serviceId: string): boolean {
    const state = this.circuits.get(serviceId);
    if (!state) {
      return false;
    }

    state.state = 'CLOSED';
    state.failureCount = 0;
    state.slowCallCount = 0;
    state.successCount = 0;
    state.callHistory = [];
    state.nextRetryTime = 0;

    console.log(`🔄 Circuit breaker for ${serviceId} has been reset`);
    return true;
  }

  /**
   * Start monitoring and cleanup
   */
  private startMonitoring(): void {
    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupMetrics();
    }, 5 * 60 * 1000);

    // Log circuit status every minute
    setInterval(() => {
      this.logCircuitStatus();
    }, 60 * 1000);
  }

  /**
   * Cleanup old metrics
   */
  private cleanupMetrics(): void {
    // In a production environment, you might want to persist these
    // For now, we'll keep them in memory
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [_serviceId, state] of this.circuits.entries()) {
      state.callHistory = state.callHistory.filter(
        call => call.timestamp > cutoff
      );
    }
  }

  /**
   * Log circuit breaker status
   */
  private logCircuitStatus(): void {
    const openCircuits = Array.from(this.circuits.entries())
      .filter(([_, state]) => state.state === 'OPEN')
      .map(([serviceId, _]) => serviceId);

    if (openCircuits.length > 0) {
      console.warn(`⚠️ Open circuit breakers: ${openCircuits.join(', ')}`);
    }

    const halfOpenCircuits = Array.from(this.circuits.entries())
      .filter(([_, state]) => state.state === 'HALF_OPEN')
      .map(([serviceId, _]) => serviceId);

    if (halfOpenCircuits.length > 0) {
      console.info(`🔄 Half-open circuit breakers: ${halfOpenCircuits.join(', ')}`);
    }
  }
}

// Global singleton instance
export const circuitBreakerService = new CircuitBreakerService();
