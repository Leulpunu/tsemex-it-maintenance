import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background-color: ${props => props.theme.cardBackground};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Select = styled.select`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  padding: 0.5rem;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    opacity: 0.9;
  }
`;

const Link = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.error};
  margin-bottom: 1rem;
`;

function Signup({ onSignup }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
      onSignup(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <FormContainer>
      <h2>{t('signup.title')}</h2>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder={t('signup.username')}
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder={t('signup.email')}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder={t('signup.password')}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">{t('signup.user')}</option>
          <option value="admin">{t('signup.admin')}</option>
          <option value="manager">{t('signup.manager')}</option>
        </Select>
        <Button type="submit">{t('signup.signupButton')}</Button>
      </Form>
      <p>{t('signup.haveAccount')} <Link href="/login">{t('signup.loginLink')}</Link></p>
    </FormContainer>
  );
}

export default Signup;
