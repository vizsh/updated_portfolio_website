import React, { useState } from 'react';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

interface TrashItem {
  name: string;
  originalLocation: string;
  dateDeleted: string;
  size: string;
}

const INITIAL_TRASH: TrashItem[] = [
  { name: 'Internet Explorer 6.exe', originalLocation: 'C:\\Program Files', dateDeleted: '10/14/2006', size: '12,410 KB' },
  { name: 'Adobe Flash Player.ocx', originalLocation: 'C:\\WINDOWS\\System32', dateDeleted: '12/31/2020', size: '2,145 KB' },
  { name: 'Layout_Using_HTML_Tables.html', originalLocation: 'C:\\Websites\\OldPortfolio', dateDeleted: '04/18/2004', size: '34 KB' },
  { name: 'jQuery_v1.4_minified.js', originalLocation: 'C:\\Scripts\\Vendor', dateDeleted: '08/02/2012', size: '98 KB' },
  { name: 'Microservices_Overengineered_v1.docx', originalLocation: 'C:\\My Documents', dateDeleted: 'Yesterday', size: '512 KB' }
];

export const RecycleBin: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>(INITIAL_TRASH);

  const handleEmpty = () => {
    retroAudio.playBeep(300, 0.15);
    setItems([]);
  };

  const handleRestore = () => {
    retroAudio.playStartup();
    setItems(INITIAL_TRASH);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* Actions Toolbar */}
      <div
        className="win-outset"
        style={{
          display: 'flex',
          gap: '8px',
          padding: '4px 8px',
          background: '#c0c0c0',
          borderBottom: '1px solid #808080'
        }}
      >
        <button className="win-button" onClick={handleEmpty} disabled={items.length === 0}>
          🗑️ Empty Recycle Bin
        </button>
        <button className="win-button" onClick={handleRestore} disabled={items.length > 0}>
          ♻️ Restore All Items
        </button>
      </div>

      {/* Trash Contents Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <RetroIcon name="recycle-empty" size={48} />
            <p style={{ marginTop: '12px', fontSize: '13px' }}>The Recycle Bin is completely empty.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#e0e0e0', borderBottom: '1px solid #808080', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px' }}>Name</th>
                <th style={{ padding: '4px 8px' }}>Original Location</th>
                <th style={{ padding: '4px 8px' }}>Date Deleted</th>
                <th style={{ padding: '4px 8px' }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#000080', e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000000')}
                >
                  <td style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RetroIcon name="document" size={14} />
                    <span>{item.name}</span>
                  </td>
                  <td style={{ padding: '4px 8px' }}>{item.originalLocation}</td>
                  <td style={{ padding: '4px 8px' }}>{item.dateDeleted}</td>
                  <td style={{ padding: '4px 8px' }}>{item.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Bar */}
      <div
        className="win-sunken"
        style={{
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          fontSize: '11px',
          background: '#c0c0c0'
        }}
      >
        <span>{items.length} object(s)</span>
      </div>
    </div>
  );
};
