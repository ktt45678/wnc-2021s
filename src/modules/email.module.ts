import axios from 'axios';

import { HttpException } from '../common/exceptions/http.exception';
import { SENDINBLUE_API_KEY } from '../config';

export const sendEmailSIB = async (email: string, name: string, templateId: number, params: any) => {
  const headers = { 'api-key': SENDINBLUE_API_KEY };
  const data = {
    templateId,
    params,
    to: [{ email, name }]
  };
  try {
    const response = await axios.post('https://api.sendinblue.com/v3/smtp/email', data, { headers });
    return response.data;
  } catch (e) {
    console.error(e.response);
    throw new HttpException({ status: 503, message: `Received ${e.response.status} ${e.response.statusText} error from third party api` });
  }
}