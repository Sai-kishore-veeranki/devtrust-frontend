import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function connectIncidentSocket(onIncident) {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('WebSocket connected');
      client.subscribe('/topic/incidents', (message) => {
        const incident = JSON.parse(message.body);
        onIncident(incident);
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error', frame);
    },
  });

  client.activate();
  return client;
}