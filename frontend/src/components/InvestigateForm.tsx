import React, { useState } from 'react';
import { Search, Zap, AlertCircle, Sparkles } from 'lucide-react';

interface InvestigateFormProps {
  onInvestigate: (formData: {
    service: string;
    environment: string;
    error_code: string;
    error_message: string;
    description: string;
    deployment_version: string;
  }) => void;
  isLoading: boolean;
}

export const InvestigateForm: React.FC<InvestigateFormProps> = ({
  onInvestigate,
  isLoading,
}) => {
  const [service, setService] = useState('Payment API');
  const [environment, setEnvironment] = useState('Production');
  const [errorCode, setErrorCode] = useState('DB-504');
  const [errorMessage, setErrorMessage] = useState('Database connection pool limit exceeded (10000ms)');
  const [description, setDescription] = useState('Payment checkout failing for 15% of active users with DB connection timeout errors during peak checkout traffic.');
  const [deploymentVersion, setDeploymentVersion] = useState('v2.4.1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvestigate({
      service,
      environment,
      error_code: errorCode,
      error_message: errorMessage,
      description,
      deployment_version: deploymentVersion,
    });
  };

  const applyPreset = (presetType: string) => {
    if (presetType === 'payment_timeout') {
      setService('Payment API');
      setEnvironment('Production');
      setErrorCode('DB-504');
      setErrorMessage('Database connection pool limit exceeded (10000ms)');
      setDescription('Payment checkout failing for 15% of active users with DB connection timeout errors during peak checkout traffic.');
      setDeploymentVersion('v2.4.1');
    } else if (presetType === 'auth_crash') {
      setService('Authentication Service');
      setEnvironment('Production');
      setErrorCode('AUTH-401');
      setErrorMessage('JWT signing key rotation mismatch');
      setDescription('Users unable to log in following hotfix release. Token validation fails across microservices.');
      setDeploymentVersion('v1.8.9');
    } else if (presetType === 'api_gateway') {
      setService('API Gateway');
      setEnvironment('Production');
      setErrorCode('GW-502');
      setErrorMessage('Bad Gateway upstream connection refused');
      setDescription('Upstream microservice unresponsive under load spike.');
      setDeploymentVersion('v3.1.0');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 space-y-2">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4" /> Real AI Incident Investigation
        </div>
        <h2 className="text-2xl font-bold text-white">Investigate Production Incident</h2>
        <p className="text-slate-300 text-sm">
          Enter current incident symptoms below. IncidentMemory will query **Hindsight** persistent memory to recall historical matching resolutions and generate diagnostic steps.
        </p>
      </div>

      {/* Demo Preset Quick-Select */}
      <div className="glass-panel p-4 bg-purple-950/20 border-purple-800/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 text-amber-400" /> Quick Hackathon Demo Scenarios:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('payment_timeout')}
            className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-xs text-purple-200 font-medium transition-colors"
          >
            🔥 Payment API (DB-504 Connection Pool)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('auth_crash')}
            className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-xs text-purple-200 font-medium transition-colors"
          >
            🔑 Auth Service (AUTH-401 JWT Rotation)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('api_gateway')}
            className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-xs text-purple-200 font-medium transition-colors"
          >
            🌐 API Gateway (GW-502 Upstream Refused)
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Service Name *</label>
            <input
              type="text"
              className="form-input"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              placeholder="e.g. Payment API"
            />
          </div>

          <div>
            <label className="form-label">Environment *</label>
            <select
              className="form-input"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Error Code</label>
            <input
              type="text"
              className="form-input"
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
              placeholder="e.g. DB-504"
            />
          </div>

          <div>
            <label className="form-label">Deployment Version</label>
            <input
              type="text"
              className="form-input"
              value={deploymentVersion}
              onChange={(e) => setDeploymentVersion(e.target.value)}
              placeholder="e.g. v2.4.1"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Error Message *</label>
          <input
            type="text"
            className="form-input"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            required
            placeholder="e.g. Connection pool timeout limit exceeded"
          />
        </div>

        <div>
          <label className="form-label">Incident Description / Telemetry Symptoms *</label>
          <textarea
            className="form-input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe what failed, affected users, and system behavior..."
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full md:w-auto text-base py-3 px-8"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recalling Hindsight Memory...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" /> INVESTIGATE INCIDENT
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
