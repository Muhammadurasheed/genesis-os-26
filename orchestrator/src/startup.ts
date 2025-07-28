import { exec } from 'child_process';

// =============================================================================
// ENHANCED ERROR HANDLING & STARTUP MANAGEMENT
// =============================================================================

// Global error handlers - MUST BE FIRST
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

process.on('warning', (warning) => {
  console.warn('⚠️ NODE WARNING:', warning.name, warning.message);
});

let isShuttingDown = false;

export async function killPortProcesses(port: number): Promise<void> {
  if (isShuttingDown) return;
  
  return new Promise((resolve) => {
    console.log(`🔍 Checking for processes on port ${port}...`);
    
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout) {
          console.log(`✅ Port ${port} is free`);
          return resolve();
        }

        const lines = stdout.split('\n');
        const pids = new Set<string>();
        
        lines.forEach((line: string) => {
          const match = line.match(/\s+(\d+)$/);
          if (match && match[1] !== '0') pids.add(match[1]);
        });

        if (pids.size === 0) {
          console.log(`✅ Port ${port} is free`);
          return resolve();
        }

        console.log(`🔫 Found ${pids.size} processes on port ${port}, killing...`);
        
        const killPromises = Array.from(pids).map(pid => 
          new Promise<void>(resolve => {
            exec(`taskkill /F /PID ${pid}`, (error) => {
              if (error) console.log(`⚠️ Failed to kill PID ${pid}`);
              else console.log(`✅ Killed PID ${pid}`);
              resolve();
            });
          })
        );

        Promise.all(killPromises).then(() => {
          setTimeout(() => {
            console.log(`✅ Port ${port} cleanup complete`);
            resolve();
          }, 2000);
        });
      });
    } else {
      exec(`lsof -ti :${port}`, (error, stdout) => {
        if (error || !stdout.trim()) {
          console.log(`✅ Port ${port} is free`);
          return resolve();
        }

        const pids = stdout.trim().split('\n').filter(pid => pid);
        console.log(`🔫 Found ${pids.length} processes on port ${port}, killing...`);
        
        const killPromises = pids.map(pid => 
          new Promise<void>(resolve => {
            exec(`kill -9 ${pid}`, (error) => {
              if (error) console.log(`⚠️ Failed to kill PID ${pid}`);
              else console.log(`✅ Killed PID ${pid}`);
              resolve();
            });
          })
        );

        Promise.all(killPromises).then(() => {
          setTimeout(() => {
            console.log(`✅ Port ${port} cleanup complete`);
            resolve();
          }, 2000);
        });
      });
    }
  });
}

export async function gracefulShutdown(signal: string, server: any) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n🚨 Received ${signal}. Initiating graceful shutdown...`);
  
  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('✅ HTTP server closed');
          resolve();
        });
      });
    }
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

export async function startServerWithRetry(app: any, PORT: number): Promise<any> {
  let retries = 3;
  let server: any = null;
  
  console.log(`🚀 Starting GenesisOS Orchestrator...`);
  
  while (retries > 0) {
    try {
      console.log(`🧹 Cleaning up port ${PORT} (attempt ${4 - retries}/3)...`);
      await killPortProcesses(PORT);
      
      if (isShuttingDown) {
        console.log('⚠️ Shutdown in progress, aborting startup');
        return null;
      }
      
      console.log(`📡 Creating HTTP server on port ${PORT}...`);
      
      return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
          console.log(`✅ Server successfully started!`);
          console.log(`🚀 GenesisOS Orchestrator ready at http://localhost:${PORT}`);
          console.log(`🧠 Intent Understanding Engine: FAANG-LEVEL EXCELLENCE ACTIVE`);
          console.log(`🤔 Clarification Engine: SOCRATIC QUESTIONING READY`);
          
          // Setup graceful shutdown for this server instance
          process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
          process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
          
          resolve(server);
        });

        server.on('error', (err: any) => {
          console.error(`❌ Server error:`, err.message);
          
          if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is in use (attempt ${4 - retries}/3)`);
            if (retries > 1) {
              console.log(`🔄 Retrying in 3 seconds...`);
              retries--;
              setTimeout(() => {
                startServerWithRetry(app, PORT).then(resolve).catch(reject);
              }, 3000);
              return;
            } else {
              console.error(`💀 Unable to start server after 3 attempts`);
              console.error(`🔧 Manual cleanup: taskkill /F /IM node.exe /IM ts-node.exe`);
            }
          }
          
          reject(err);
        });
      });

    } catch (error) {
      console.error(`❌ Startup failed (attempt ${4 - retries}/3):`, error);
      retries--;
      if (retries === 0) {
        console.error('💀 All startup attempts failed');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  throw new Error('Failed to start server after all retry attempts');
}