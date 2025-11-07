export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function formatDataForExport(campaigns: any[]) {
  return campaigns.map(campaign => ({
    'ID': campaign.id,
    'Nome': campaign.name,
    'Status': campaign.status,
    'Data Início': new Date(campaign.start_date).toLocaleDateString('pt-BR'),
    'Data Fim': new Date(campaign.end_date).toLocaleDateString('pt-BR'),
    'Orçamento': campaign.budget,
    'Leads': campaign.leads?.length || 0,
    'Ações de Marketing': campaign.marketing_actions?.length || 0,
    'Última Atualização': new Date(campaign.updated_at).toLocaleDateString('pt-BR'),
  }));
}
