import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';

function AdminAutomation() {
  const [automationRules, setAutomationRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  
  const { showSuccess, showError } = useToast();

  const ruleTypeIcons = {
    'low-stock-alert': '⚠️',
    'auto-reorder': '🔄',
    'price-update': '💰',
    'promotion': '🎯'
  };

  const ruleTypeNames = {
    'low-stock-alert': 'Low Stock Alert',
    'auto-reorder': 'Auto Reorder',
    'price-update': 'Price Update',
    'promotion': 'Promotion Management'
  };

  useEffect(() => {
    loadAutomationRules();
  }, []);

  const loadAutomationRules = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.get(`${API_BASE}/products/automation-rules`);
      
      if (response.data.success) {
        setAutomationRules(response.data.rules || []);
      }
    } catch (error) {
      console.error('Error loading automation rules:', error);
      showError('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.patch(`${API_BASE}/products/automation-rules/${ruleId}/toggle`);
      
      if (response.data.success) {
        showSuccess(response.data.message);
        loadAutomationRules();
      }
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      showError('Failed to toggle automation rule');
    }
  };

  const executeRules = async () => {
    try {
      setExecuting(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.post(`${API_BASE}/products/automation-rules/execute`);
      
      if (response.data.success) {
        showSuccess('Automation rules executed successfully');
        loadAutomationRules();
      }
    } catch (error) {
      console.error('Error executing automation rules:', error);
      showError('Failed to execute automation rules');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading automation rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation & Business Rules</h2>
          <p className="text-gray-600">Automate your business processes and workflows</p>
        </div>
        <button
          onClick={executeRules}
          disabled={executing}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {executing ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing...
            </>
          ) : (
            <>
              <span>▶️</span>
              Execute All Rules
            </>
          )}
        </button>
      </div>

      {/* Automation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Rules</p>
              <p className="text-2xl font-semibold text-gray-900">
                {automationRules.filter(rule => rule.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Rules</p>
              <p className="text-2xl font-semibold text-gray-900">
                {automationRules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Executions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {automationRules.reduce((sum, rule) => sum + (rule.executionCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
          <p className="text-sm text-gray-600">Configure and manage your business automation rules</p>
        </div>

        <div className="divide-y divide-gray-200">
          {automationRules.map((rule) => (
            <div key={rule._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">{ruleTypeIcons[rule.type] || '⚙️'}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{rule.name}</h4>
                    <p className="text-sm text-gray-600">
                      {ruleTypeNames[rule.type] || rule.type}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Executions: {rule.executionCount || 0}
                      </span>
                      {rule.lastExecuted && (
                        <span>
                          Last run: {new Date(rule.lastExecuted).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rule.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rule.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                  
                  <button
                    onClick={() => toggleRule(rule._id)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      rule.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {rule.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Rule Details */}
              <div className="mt-4 ml-16">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Conditions:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {rule.conditions?.map((condition, index) => (
                      <li key={index}>
                        • {condition.field} {condition.operator} {condition.value}
                      </li>
                    ))}
                  </ul>

                  <h5 className="text-sm font-medium text-gray-900 mt-3 mb-2">Actions:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {rule.actions?.map((action, index) => (
                      <li key={index}>
                        • {action.type}
                        {action.parameters && (
                          <span className="text-gray-500 ml-2">
                            ({Object.entries(action.parameters).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(', ')})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {automationRules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules found</h3>
            <p className="text-gray-600">Automation rules will be created automatically based on your business needs</p>
          </div>
        )}
      </div>

      {/* Available Automation Types */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Automation Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(ruleTypeNames).map(([type, name]) => (
            <div key={type} className="p-4 border border-gray-200 rounded-lg">
              <div className="text-center">
                <span className="text-3xl mb-2 block">{ruleTypeIcons[type]}</span>
                <h4 className="font-medium text-gray-900">{name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {type === 'low-stock-alert' && 'Notify when products are running low'}
                  {type === 'auto-reorder' && 'Automatically reorder products'}
                  {type === 'price-update' && 'Update prices based on rules'}
                  {type === 'promotion' && 'Manage promotional campaigns'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📧</span>
              <p className="text-sm font-medium">Send Low Stock Alerts</p>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🔄</span>
              <p className="text-sm font-medium">Sync Inventory</p>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📈</span>
              <p className="text-sm font-medium">Update Analytics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAutomation; 