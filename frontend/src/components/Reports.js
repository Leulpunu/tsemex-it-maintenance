import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const PeriodSelector = styled.div`
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;

  &:hover {
    opacity: 0.9;
  }

  &.active {
    background-color: ${props => props.theme.accent};
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 1rem;
  background-color: ${props => props.theme.cardBackground};
  text-align: center;
`;

const ChartContainer = styled.div`
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  border: 1px solid ${props => props.theme.border};
  padding: 0.5rem;
  background-color: ${props => props.theme.primary};
  color: white;
`;

const Td = styled.td`
  border: 1px solid ${props => props.theme.border};
  padding: 0.5rem;
  background-color: ${props => props.theme.cardBackground};
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#ffc107';
      case 'in-progress': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: flex-end;
`;

const BackButton = styled(Button)`
  background-color: ${props => props.theme.secondary};
  margin-bottom: 1rem;

  &:hover {
    background-color: ${props => props.theme.secondary};
    opacity: 0.9;
  }
`;

function Reports() {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport(selectedPeriod);
  }, [selectedPeriod]);

  const fetchReport = async (period) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${period}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { key: 'daily', label: t('reports.daily') },
    { key: 'weekly', label: t('reports.weekly') },
    { key: 'monthly', label: t('reports.monthly') },
    { key: 'annual', label: t('reports.annual') }
  ];

  const exportToExcel = () => {
    if (!reportData) return;

    const data = reportData.requests.map(request => ({
      Title: request.title,
      User: request.user.username,
      Priority: request.priority,
      Category: request.category,
      Status: request.status,
      Created: new Date(request.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    XLSX.writeFile(wb, `IT-Maintenance-Reports-${selectedPeriod}.xlsx`);
  };

  const exportToPDF = async () => {
    if (!reportData) return;

    const canvas = await html2canvas(document.querySelector('.reports-content'));
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`IT-Maintenance-Reports-${selectedPeriod}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <ReportsContainer>
      <BackButton onClick={() => window.history.back()}>{t('common.backToDashboard')}</BackButton>
      <Header>
        <h2>{t('reports.title')}</h2>
      </Header>

      <PeriodSelector>
        <h3>{t('reports.selectPeriod')}</h3>
        {periods.map(period => (
          <Button
            key={period.key}
            className={selectedPeriod === period.key ? 'active' : ''}
            onClick={() => setSelectedPeriod(period.key)}
          >
            {period.label}
          </Button>
        ))}
      </PeriodSelector>

      {loading && <p>{t('reports.loading')}</p>}

      {reportData && (
        <>
          <ExportButtons>
            <Button onClick={exportToExcel}>{t('reports.exportExcel')}</Button>
            <Button onClick={exportToPDF}>{t('reports.exportPdf')}</Button>
            <Button onClick={printReport}>{t('reports.print')}</Button>
          </ExportButtons>

          <div className="reports-content">
            <SummaryGrid>
              <SummaryCard>
                <h3>{reportData.summary.totalRequests}</h3>
                <p>{t('reports.totalRequests')}</p>
              </SummaryCard>
              <SummaryCard>
                <h3>{reportData.summary.pending}</h3>
                <p>{t('reports.pending')}</p>
              </SummaryCard>
              <SummaryCard>
                <h3>{reportData.summary.inProgress}</h3>
                <p>{t('reports.inProgress')}</p>
              </SummaryCard>
              <SummaryCard>
                <h3>{reportData.summary.completed}</h3>
                <p>{t('reports.completed')}</p>
              </SummaryCard>
              <SummaryCard>
                <h3>{reportData.summary.rejected}</h3>
                <p>{t('reports.rejected')}</p>
              </SummaryCard>
            </SummaryGrid>

            <ChartContainer>
              <h3>{t('reports.byPriority')}</h3>
              <p>Low: {reportData.summary.byPriority.low}, Medium: {reportData.summary.byPriority.medium}, High: {reportData.summary.byPriority.high}, Urgent: {reportData.summary.byPriority.urgent}</p>

              <h3>{t('reports.byCategory')}</h3>
              <p>Hardware: {reportData.summary.byCategory.hardware}, Software: {reportData.summary.byCategory.software}, Network: {reportData.summary.byCategory.network}, Account: {reportData.summary.byCategory.account}, Other: {reportData.summary.byCategory.other}</p>
            </ChartContainer>

            <h3>{t('reports.requestsList')}</h3>
            <Table>
              <thead>
                <tr>
                  <Th>{t('reports.requestTitle')}</Th>
                  <Th>{t('reports.user')}</Th>
                  <Th>{t('reports.priority')}</Th>
                  <Th>{t('reports.category')}</Th>
                  <Th>{t('reports.status')}</Th>
                  <Th>{t('reports.created')}</Th>
                </tr>
              </thead>
              <tbody>
                {reportData.requests.map(request => (
                  <tr key={request.id}>
                    <Td>{request.title}</Td>
                    <Td>{request.user.username}</Td>
                    <Td>{request.priority}</Td>
                    <Td>{request.category}</Td>
                    <Td><StatusBadge status={request.status}>{request.status}</StatusBadge></Td>
                    <Td>{new Date(request.createdAt).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </ReportsContainer>
  );
}

export default Reports;
