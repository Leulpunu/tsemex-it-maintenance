import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const RequestCard = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
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

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;

  &:hover {
    background-color: ${props => props.theme.accent};
  }
`;

const BackButton = styled(Button)`
  background-color: ${props => props.theme.secondary};
  margin-bottom: 1rem;

  &:hover {
    background-color: ${props => props.theme.secondary};
    opacity: 0.9;
  }
`;

const RejectButton = styled(Button)`
  background-color: ${props => props.theme.error};

  &:hover {
    background-color: ${props => props.theme.error};
    opacity: 0.9;
  }
`;

function AdminPanel() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/requests');
      setRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/requests/${id}`, { status });
      fetchAllRequests();
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  return (
    <AdminContainer>
      <BackButton onClick={() => window.history.back()}>{t('common.backToDashboard')}</BackButton>
      <Header>
        <h2>{t('adminPanel.title')}</h2>
      </Header>

      {requests.length === 0 ? (
        <p>{t('adminPanel.noRequests')}</p>
      ) : (
        requests.map(request => (
          <RequestCard key={request.id}>
            <h3>{request.title}</h3>
            <p><strong>{t('adminPanel.user')}:</strong> {request.user.username} ({request.user.email})</p>
            <p>{request.description}</p>
            <p><strong>{t('adminPanel.priority')}:</strong> {request.priority}</p>
            <p><strong>{t('adminPanel.category')}:</strong> {request.category}</p>
            <p><strong>{t('adminPanel.department')}:</strong> {request.department}</p>
            <p><strong>{t('adminPanel.status')}:</strong> <StatusBadge status={request.status}>{request.status}</StatusBadge></p>
            <p><strong>{t('adminPanel.created')}:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
            {request.status === 'pending' && (
              <div>
                <Button onClick={() => updateStatus(request.id, 'in-progress')}>{t('adminPanel.startWork')}</Button>
                <RejectButton onClick={() => updateStatus(request.id, 'rejected')}>{t('adminPanel.reject')}</RejectButton>
              </div>
            )}
            {request.status === 'in-progress' && (
              <Button onClick={() => updateStatus(request.id, 'completed')}>{t('adminPanel.markComplete')}</Button>
            )}
          </RequestCard>
        ))
      )}
    </AdminContainer>
  );
}

export default AdminPanel;
