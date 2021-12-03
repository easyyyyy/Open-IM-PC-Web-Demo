import { contextBridge } from 'electron';
import type { API, APIKey } from '../src/@types/api';

const apiKey: APIKey = 'electron';
const api: API = {};

contextBridge.exposeInMainWorld(apiKey, api);
