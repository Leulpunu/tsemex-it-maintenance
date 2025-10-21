import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

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
`;

const RejectButton = styled(Button)`
  background-color: ${props => props.theme.error};
`;

function AdminPanel() {
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
      <Header>
        <h2>Admin Panel - All IT Maintenance Requests</h2>
      </Header>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        requests.map(request => (
          <RequestCard key={request.id}>
            <h3>{request.title}</h3>
            <p><strong>User:</strong> {request.user.username} ({request.user.email})</p>
            <p>{request.description}</p>
            <p><strong>Priority:</strong> {request.priority}</p>
            <p><strong>Category:</strong> {request.category}</p>
            <p><strong>Department:</strong> {request.department}</p>
            <p><strong>Status:</strong> <StatusBadge status={request.status}>{request.status}</StatusBadge></p>
            <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
            {request.status === 'pending' && (
              <div>
                <Button onClick={() => updateStatus(request.id, 'in-progress')}>Start Work</Button>
                <RejectButton onClick={() => updateStatus(request.id, 'rejected')}>Reject</RejectButton>
              </div>
            )}
            {request.status === 'in-progress' && (
              <Button onClick={() => updateStatus(request.id, 'completed')}>Mark Complete</Button>
            )}
          </RequestCard>
        ))
      )}
    </AdminContainer>
  );
}

export default AdminPanel;
