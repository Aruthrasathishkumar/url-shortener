import React from 'react';

function AnalyticsSummary({ analytics }) {
  if (!analytics) {
    return null;
  }

  const { totalClicks, clicksOverTime, topReferrers, devices } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Clicks</div>
          <div className="text-3xl font-bold text-gray-900">{totalClicks}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Top Referrer</div>
          <div className="text-lg font-semibold text-gray-900 truncate">
            {topReferrers.length > 0 ? topReferrers[0].referrer : 'N/A'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Desktop Clicks</div>
          <div className="text-3xl font-bold text-gray-900">
            {devices.find((d) => d.device === 'desktop')?.clicks || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Mobile Clicks</div>
          <div className="text-3xl font-bold text-gray-900">
            {devices.find((d) => d.device === 'mobile')?.clicks || 0}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks Over Time</h3>
        {clicksOverTime.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Clicks
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clicksOverTime.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.clicks}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <div
                          className="bg-blue-500 h-4 rounded"
                          style={{
                            width: `${(item.clicks / Math.max(...clicksOverTime.map((c) => c.clicks))) * 200}px`,
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No click data available yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
          {topReferrers.length > 0 ? (
            <div className="space-y-2">
              {topReferrers.slice(0, 5).map((referrer, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900 truncate flex-1 mr-2">
                    {referrer.referrer}
                  </span>
                  <span className="text-sm font-medium text-gray-600">{referrer.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No referrer data available.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          {devices.length > 0 ? (
            <div className="space-y-2">
              {devices.map((device, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900 capitalize">{device.device}</span>
                  <span className="text-sm font-medium text-gray-600">{device.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No device data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSummary;
