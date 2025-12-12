import React from 'react';
import { GlobalSettings } from '../../models/settings';

interface Props {
  settings: GlobalSettings;
  loading: boolean;
  onSave: () => void;
}

const GlobalTab: React.FC<Props> = ({ settings, loading, onSave }) => {
  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Global Ayarlar</h3>
      </div>

      <div className="settings-form-grid">
        {/* Future settings fields can be added here */}
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={onSave}>
          Kaydet
        </button>
      </div>
    </div>
  );
};

export default GlobalTab;

