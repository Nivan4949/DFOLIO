/**
 * Converts an array of objects to a CSV string and initiates a browser file download.
 * @param data Array of objects to export
 * @param filename Name of the downloaded file (without extension)
 */
export const exportToCSV = (data: Record<string, any>[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Extract keys for headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
