import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import type { UserProfile } from '@shared/schema';

export interface BMRResult {
  bmr: number;
  method: string;
  confidence: number;
  components: {
    base: number;
    gender_adjustment: number;
  };
}

export interface FrameworkHealth {
  status: 'healthy' | 'warning' | 'error';
  plugins_loaded: number;
  calculations_performed: number;
  uptime: number;
  memory_usage: number;
}

export class PythonFrameworkService {
  private frameworkPath: string;

  constructor() {
    this.frameworkPath = path.join(process.cwd(), 'python_framework.py');
  }

  async calculateBMR(profile: UserProfile, method: string = 'mifflin_st_jeor'): Promise<BMRResult> {
    const profileData = {
      weight_kg: parseFloat(profile.weight?.toString() || '70'),
      height_cm: parseFloat(profile.height?.toString() || '170'),
      age: profile.age || 25,
      gender: profile.gender || 'male'
    };

    const command = {
      action: 'calculate_bmr',
      method,
      profile: profileData
    };

    try {
      const result = await this.executePythonCommand(command);
      
      // Parse the result and ensure it matches BMRResult interface
      return {
        bmr: result.bmr || 0,
        method: result.method || method,
        confidence: result.confidence || 0.95,
        components: result.components || {
          base: result.bmr || 0,
          gender_adjustment: profileData.gender === 'male' ? 5 : -161
        }
      };
    } catch (error) {
      console.error('Error calculating BMR:', error);
      // Fallback calculation using Mifflin-St Jeor
      const base = 10 * profileData.weight_kg + 6.25 * profileData.height_cm - 5 * profileData.age;
      const genderConstant = profileData.gender === 'male' ? 5 : -161;
      const bmr = base + genderConstant;
      
      return {
        bmr: Math.round(bmr * 10) / 10,
        method: 'mifflin_st_jeor_fallback',
        confidence: 0.85,
        components: {
          base,
          gender_adjustment: genderConstant
        }
      };
    }
  }

  async getHealthStatus(): Promise<FrameworkHealth> {
    const command = {
      action: 'health_check'
    };

    try {
      const result = await this.executePythonCommand(command);
      
      return {
        status: result.status || 'healthy',
        plugins_loaded: result.plugins_loaded || 0,
        calculations_performed: result.calculations_performed || 0,
        uptime: result.uptime || 0,
        memory_usage: result.memory_usage || 0
      };
    } catch (error) {
      console.error('Error checking framework health:', error);
      return {
        status: 'error',
        plugins_loaded: 0,
        calculations_performed: 0,
        uptime: 0,
        memory_usage: 0
      };
    }
  }

  async loadPlugin(pluginName: string, configuration?: any): Promise<boolean> {
    const command = {
      action: 'load_plugin',
      plugin_name: pluginName,
      configuration
    };

    try {
      const result = await this.executePythonCommand(command);
      return result.success || false;
    } catch (error) {
      console.error('Error loading plugin:', error);
      return false;
    }
  }

  async unloadPlugin(pluginName: string): Promise<boolean> {
    const command = {
      action: 'unload_plugin',
      plugin_name: pluginName
    };

    try {
      const result = await this.executePythonCommand(command);
      return result.success || false;
    } catch (error) {
      console.error('Error unloading plugin:', error);
      return false;
    }
  }

  private async executePythonCommand(command: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [this.frameworkPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          // Try to parse the last line as JSON (framework output)
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });

      // Send command to Python process
      python.stdin.write(JSON.stringify(command) + '\n');
      python.stdin.end();
    });
  }
}
