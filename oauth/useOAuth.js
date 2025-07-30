import { useEffect, useState } from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { OAUTH_CONFIG } from './oauth-config';

export const useOAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const redirectUri = makeRedirectUri({ scheme: 'apptoolaccess', path: 'oauth/callback' });

  const [request, response, promptAsync] = useAuthRequest({
    clientId: OAUTH_CONFIG.CLIENT_ID,
    scopes: OAUTH_CONFIG.SCOPES,
    redirectUri,
    responseType: 'code',
  }, {
    authorizationEndpoint: OAUTH_CONFIG.AUTH_URL,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthResponse(response);
    }
  }, [response]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const userInfo = await getUserInfo(token);
        setUser(userInfo);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('No authenticated');
    }
  };

  const handleAuthResponse = async (response) => {
    try {
      const { code } = response.params;
      const tokens = await exchangeCodeForToken(code);
      
      await AsyncStorage.setItem('access_token', tokens.access_token);
      await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
      
      const userInfo = await getUserInfo(tokens.access_token);
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error in auth:', error);
    }
  };

  const exchangeCodeForToken = async (code) => {
    const response = await axios.post(OAUTH_CONFIG.TOKEN_URL, {
      grant_type: 'authorization_code',
      code,
      client_id: OAUTH_CONFIG.CLIENT_ID,
      client_secret: OAUTH_CONFIG.CLIENT_SECRET,
      redirect_uri: redirectUri
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Error getting tokens');
  };

  const getUserInfo = async (token) => {
    const response = await axios.get(OAUTH_CONFIG.USERINFO_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  const login = () => {
    promptAsync();
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading: !request
  };
};