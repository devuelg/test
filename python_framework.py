#!/usr/bin/env python3
"""
FitFramework Pro - Python Integration Bridge
===========================================

A bridge service that integrates the scalable transformation framework
with the Node.js backend, providing BMR calculations, plugin management,
and health monitoring capabilities.

This module serves as a command-line interface that accepts JSON commands
via stdin and returns JSON responses via stdout for seamless integration
with the Node.js backend.
"""

import json
import sys
import time
import math
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('python_framework.log'),
        logging.StreamHandler(sys.stderr)  # Use stderr to avoid mixing with stdout JSON
    ]
)

logger = logging.getLogger(__name__)

class Gender(Enum):
    MALE = "male"
    FEMALE = "female"

class ActivityLevel(Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTRA_ACTIVE = "extra_active"

@dataclass
class UserProfile:
    """User profile data structure for calculations"""
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    activity_level: Optional[str] = None
    body_fat_percentage: Optional[float] = None

class BMRCalculator:
    """Advanced BMR calculation engine with multiple methodologies"""
    
    @staticmethod
    def mifflin_st_jeor(profile: UserProfile) -> Dict[str, Any]:
        """
        Mifflin-St Jeor Equation (most accurate for general population)
        Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
        Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
        """
        try:
            base = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age
            gender_constant = 5 if profile.gender.lower() == 'male' else -161
            bmr = base + gender_constant
            
            # Calculate confidence based on profile completeness and ranges
            confidence = BMRCalculator._calculate_confidence(profile, 'mifflin_st_jeor')
            
            return {
                'bmr': round(bmr, 1),
                'method': 'mifflin_st_jeor',
                'confidence': confidence,
                'components': {
                    'base': round(base, 1),
                    'gender_adjustment': gender_constant,
                    'weight_component': round(10 * profile.weight_kg, 1),
                    'height_component': round(6.25 * profile.height_cm, 1),
                    'age_component': round(-5 * profile.age, 1)
                }
            }
        except Exception as e:
            logger.error(f"Error in Mifflin-St Jeor calculation: {e}")
            raise

    @staticmethod
    def harris_benedict(profile: UserProfile) -> Dict[str, Any]:
        """
        Harris-Benedict Equation (revised)
        Men: BMR = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
        Women: BMR = 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
        """
        try:
            if profile.gender.lower() == 'male':
                bmr = 88.362 + (13.397 * profile.weight_kg) + (4.799 * profile.height_cm) - (5.677 * profile.age)
                base_constant = 88.362
            else:
                bmr = 447.593 + (9.247 * profile.weight_kg) + (3.098 * profile.height_cm) - (4.330 * profile.age)
                base_constant = 447.593
            
            confidence = BMRCalculator._calculate_confidence(profile, 'harris_benedict')
            
            return {
                'bmr': round(bmr, 1),
                'method': 'harris_benedict',
                'confidence': confidence,
                'components': {
                    'base_constant': base_constant,
                    'weight_component': round((13.397 if profile.gender.lower() == 'male' else 9.247) * profile.weight_kg, 1),
                    'height_component': round((4.799 if profile.gender.lower() == 'male' else 3.098) * profile.height_cm, 1),
                    'age_component': round(-(5.677 if profile.gender.lower() == 'male' else 4.330) * profile.age, 1)
                }
            }
        except Exception as e:
            logger.error(f"Error in Harris-Benedict calculation: {e}")
            raise

    @staticmethod
    def katch_mcardle(profile: UserProfile) -> Dict[str, Any]:
        """
        Katch-McArdle Formula (requires body fat percentage)
        BMR = 370 + (21.6 × LBM)
        where LBM = weight × (1 - body_fat_percentage/100)
        """
        try:
            if not profile.body_fat_percentage:
                # Estimate body fat if not provided
                estimated_bf = BMRCalculator._estimate_body_fat(profile)
                logger.warning(f"Body fat not provided, estimated at {estimated_bf}%")
                profile.body_fat_percentage = estimated_bf
            
            lean_body_mass = profile.weight_kg * (1 - profile.body_fat_percentage / 100)
            bmr = 370 + (21.6 * lean_body_mass)
            
            confidence = BMRCalculator._calculate_confidence(profile, 'katch_mcardle')
            
            return {
                'bmr': round(bmr, 1),
                'method': 'katch_mcardle',
                'confidence': confidence,
                'components': {
                    'base_constant': 370,
                    'lean_body_mass': round(lean_body_mass, 1),
                    'lbm_component': round(21.6 * lean_body_mass, 1),
                    'body_fat_used': profile.body_fat_percentage
                }
            }
        except Exception as e:
            logger.error(f"Error in Katch-McArdle calculation: {e}")
            raise

    @staticmethod
    def adaptive_ensemble(profile: UserProfile) -> Dict[str, Any]:
        """
        Adaptive ensemble method combining multiple equations with intelligent weighting
        """
        try:
            # Calculate all methods
            mifflin = BMRCalculator.mifflin_st_jeor(profile)
            harris = BMRCalculator.harris_benedict(profile)
            
            # Weight the methods based on profile characteristics
            weights = BMRCalculator._calculate_ensemble_weights(profile)
            
            # Calculate weighted average
            bmr = (mifflin['bmr'] * weights['mifflin'] + 
                   harris['bmr'] * weights['harris'])
            
            # Include Katch-McArdle if body fat is available
            if profile.body_fat_percentage:
                katch = BMRCalculator.katch_mcardle(profile)
                bmr = (bmr * 0.7 + katch['bmr'] * 0.3)  # Adjust weighting
                weights['katch_mcardle'] = 0.3
                weights['mifflin'] *= 0.7
                weights['harris'] *= 0.7
            
            confidence = min(0.99, BMRCalculator._calculate_confidence(profile, 'adaptive_ensemble') + 0.05)
            
            return {
                'bmr': round(bmr, 1),
                'method': 'adaptive_ensemble',
                'confidence': confidence,
                'components': {
                    'mifflin_bmr': mifflin['bmr'],
                    'harris_bmr': harris['bmr'],
                    'weights_used': weights,
                    'ensemble_logic': 'intelligent_weighting_v2'
                }
            }
        except Exception as e:
            logger.error(f"Error in adaptive ensemble calculation: {e}")
            raise

    @staticmethod
    def _calculate_confidence(profile: UserProfile, method: str) -> float:
        """Calculate confidence score based on profile completeness and method accuracy"""
        base_confidence = {
            'mifflin_st_jeor': 0.95,
            'harris_benedict': 0.90,
            'katch_mcardle': 0.93,
            'adaptive_ensemble': 0.97
        }.get(method, 0.85)
        
        # Adjust based on profile completeness
        if profile.age < 18 or profile.age > 80:
            base_confidence *= 0.90
        
        # BMI-based adjustment
        bmi = profile.weight_kg / (profile.height_cm / 100) ** 2
        if bmi < 18.5 or bmi > 35:
            base_confidence *= 0.92
        
        # Body fat availability bonus
        if profile.body_fat_percentage and method == 'katch_mcardle':
            base_confidence *= 1.05
        
        return round(min(0.99, base_confidence), 3)

    @staticmethod
    def _estimate_body_fat(profile: UserProfile) -> float:
        """Estimate body fat percentage using age and BMI"""
        bmi = profile.weight_kg / (profile.height_cm / 100) ** 2
        
        if profile.gender.lower() == 'male':
            # Rough estimation for males
            bf = (1.20 * bmi) + (0.23 * profile.age) - 16.2
        else:
            # Rough estimation for females
            bf = (1.20 * bmi) + (0.23 * profile.age) - 5.4
        
        return max(5, min(50, bf))  # Clamp between reasonable ranges

    @staticmethod
    def _calculate_ensemble_weights(profile: UserProfile) -> Dict[str, float]:
        """Calculate intelligent weights for ensemble method"""
        bmi = profile.weight_kg / (profile.height_cm / 100) ** 2
        
        # Base weights
        mifflin_weight = 0.6
        harris_weight = 0.4
        
        # Adjust based on BMI (Mifflin-St Jeor is better for normal BMI)
        if 18.5 <= bmi <= 25:
            mifflin_weight = 0.7
            harris_weight = 0.3
        elif bmi > 30:
            # Harris-Benedict might be slightly better for very overweight
            mifflin_weight = 0.55
            harris_weight = 0.45
        
        # Adjust based on age
        if profile.age > 60:
            harris_weight += 0.05
            mifflin_weight -= 0.05
        
        return {
            'mifflin': round(mifflin_weight, 2),
            'harris': round(harris_weight, 2)
        }

class PluginManager:
    """Plugin management system"""
    
    def __init__(self):
        self.plugins = {}
        self.load_time = datetime.now()
    
    def load_plugin(self, plugin_name: str, configuration: Dict = None) -> bool:
        """Load a plugin with given configuration"""
        try:
            # Simulate plugin loading
            self.plugins[plugin_name] = {
                'name': plugin_name,
                'loaded_at': datetime.now(),
                'configuration': configuration or {},
                'active': True
            }
            logger.info(f"Plugin {plugin_name} loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to load plugin {plugin_name}: {e}")
            return False
    
    def unload_plugin(self, plugin_name: str) -> bool:
        """Unload a plugin"""
        try:
            if plugin_name in self.plugins:
                del self.plugins[plugin_name]
                logger.info(f"Plugin {plugin_name} unloaded successfully")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to unload plugin {plugin_name}: {e}")
            return False
    
    def get_plugin_status(self) -> Dict[str, Any]:
        """Get status of all plugins"""
        return {
            'total_plugins': len(self.plugins),
            'active_plugins': len([p for p in self.plugins.values() if p['active']]),
            'plugins': list(self.plugins.keys())
        }

class FrameworkService:
    """Main framework service for handling all operations"""
    
    def __init__(self):
        self.plugin_manager = PluginManager()
        self.start_time = datetime.now()
        self.calculations_performed = 0
        
        # Load default plugins
        self._load_default_plugins()
    
    def _load_default_plugins(self):
        """Load default plugins"""
        default_plugins = [
            'bmr_calculator_pro',
            'advanced_analytics',
            'nutrition_tracker',
            'workout_planner'
        ]
        
        for plugin in default_plugins:
            self.plugin_manager.load_plugin(plugin)
    
    def calculate_bmr(self, profile_data: Dict, method: str = 'mifflin_st_jeor') -> Dict[str, Any]:
        """Calculate BMR using specified method"""
        try:
            profile = UserProfile(
                weight_kg=float(profile_data['weight_kg']),
                height_cm=float(profile_data['height_cm']),
                age=int(profile_data['age']),
                gender=profile_data['gender'],
                activity_level=profile_data.get('activity_level'),
                body_fat_percentage=profile_data.get('body_fat_percentage')
            )
            
            # Route to appropriate calculation method
            calculator_methods = {
                'mifflin_st_jeor': BMRCalculator.mifflin_st_jeor,
                'harris_benedict': BMRCalculator.harris_benedict,
                'katch_mcardle': BMRCalculator.katch_mcardle,
                'adaptive_ensemble': BMRCalculator.adaptive_ensemble
            }
            
            if method not in calculator_methods:
                method = 'mifflin_st_jeor'  # Default fallback
            
            result = calculator_methods[method](profile)
            self.calculations_performed += 1
            
            logger.info(f"BMR calculated using {method}: {result['bmr']} cal/day")
            return result
            
        except Exception as e:
            logger.error(f"BMR calculation failed: {e}")
            raise
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get framework health status"""
        uptime = (datetime.now() - self.start_time).total_seconds()
        plugin_status = self.plugin_manager.get_plugin_status()
        
        # Simulate memory usage (in MB)
        memory_usage = 45.2 + (uptime / 3600) * 0.5  # Gradual increase over time
        
        status = 'healthy'
        if memory_usage > 100 or uptime > 86400:  # Over 100MB or 24 hours
            status = 'warning'
        if plugin_status['active_plugins'] < plugin_status['total_plugins'] / 2:
            status = 'warning'
        
        return {
            'status': status,
            'uptime': round(uptime, 2),
            'calculations_performed': self.calculations_performed,
            'plugins_loaded': plugin_status['active_plugins'],
            'total_plugins': plugin_status['total_plugins'],
            'memory_usage': round(memory_usage, 1),
            'last_health_check': datetime.now().isoformat()
        }
    
    def load_plugin(self, plugin_name: str, configuration: Dict = None) -> bool:
        """Load a plugin"""
        return self.plugin_manager.load_plugin(plugin_name, configuration)
    
    def unload_plugin(self, plugin_name: str) -> bool:
        """Unload a plugin"""
        return self.plugin_manager.unload_plugin(plugin_name)

def process_command(command: Dict[str, Any]) -> Dict[str, Any]:
    """Process incoming command and return response"""
    global framework_service
    
    action = command.get('action')
    
    try:
        if action == 'calculate_bmr':
            profile = command.get('profile', {})
            method = command.get('method', 'mifflin_st_jeor')
            result = framework_service.calculate_bmr(profile, method)
            return {'success': True, **result}
        
        elif action == 'health_check':
            health = framework_service.get_health_status()
            return {'success': True, **health}
        
        elif action == 'load_plugin':
            plugin_name = command.get('plugin_name')
            configuration = command.get('configuration', {})
            success = framework_service.load_plugin(plugin_name, configuration)
            return {'success': success}
        
        elif action == 'unload_plugin':
            plugin_name = command.get('plugin_name')
            success = framework_service.unload_plugin(plugin_name)
            return {'success': success}
        
        else:
            return {'success': False, 'error': f'Unknown action: {action}'}
    
    except Exception as e:
        logger.error(f"Command processing failed: {e}")
        return {'success': False, 'error': str(e)}

def main():
    """Main entry point for the framework service"""
    global framework_service
    
    try:
        # Initialize framework
        framework_service = FrameworkService()
        logger.info("FitFramework Pro Python service initialized")
        
        # Read command from stdin
        command_line = sys.stdin.readline().strip()
        if not command_line:
            logger.error("No command received")
            return
        
        # Parse JSON command
        command = json.loads(command_line)
        logger.info(f"Processing command: {command.get('action', 'unknown')}")
        
        # Process command and get response
        response = process_command(command)
        
        # Output JSON response to stdout
        print(json.dumps(response))
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON command: {e}")
        print(json.dumps({'success': False, 'error': 'Invalid JSON command'}))
    
    except Exception as e:
        logger.error(f"Framework service error: {e}")
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == "__main__":
    main()
