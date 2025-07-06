import { NetInfo } from '@react-native-community/netinfo';
import { queue, retry } from 'async';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const OFFLINE_QUEUE_KEY = '@ATIS_OFFLINE_QUEUE';
const CRYPTO_SECRET = 'YOUR_MOBILE_SECRET';

export class OfflineManager {
  constructor() {
    this.queue = queue(this.processTask.bind(this), 1);
    this.isConnected = true;
    this.initialize();
  }

  async initialize() {
    // Load queued tasks from storage
    const savedQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (savedQueue) {
      const decrypted = CryptoJS.AES.decrypt(savedQueue, CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);
      JSON.parse(decrypted).forEach(task => this.queue.push(task));
    }

    // Network listener
    NetInfo.addEventListener(state => {
      this.isConnected = state.isConnected;
      if (state.isConnected) this.queue.resume();
      else this.queue.pause();
    });
  }

  async addTask(task) {
    const newTask = { ...task, id: Date.now(), attempts: 0 };
    this.queue.push(newTask);
    await this.persistQueue();
  }

  async processTask(task, callback) {
    try {
      if (!this.isConnected) throw new Error('Offline');
      
      const response = await fetch(task.url, {
        method: task.method,
        headers: {
          'Authorization': `Bearer ${task.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task.data)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      callback();
      await this.removeTask(task.id);
    } catch (error) {
      task.attempts++;
      if (task.attempts < 5) {
        // Exponential backoff
        setTimeout(() => callback(error), 1000 * Math.pow(2, task.attempts));
      } else {
        callback();
        await this.removeTask(task.id);
        // Alert user about failed sync
      }
    }
  }

  async persistQueue() {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(this.queue.getQueue()), 
      CRYPTO_SECRET
    ).toString();
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, encrypted);
  }

  async removeTask(taskId) {
    const newQueue = this.queue.getQueue().filter(t => t.id !== taskId);
    this.queue.remove(() => true); // Clear all
    newQueue.forEach(task => this.queue.push(task));
    await this.persistQueue();
  }
}

export default new OfflineManager();
