import { create } from 'zustand';
import { Client } from '@stomp/stompjs';

export interface PlayerPosition {
  userId: number;
  x: number;
  y: number;
  alive: boolean;
}

export interface GameStateMessage {
  roomId: string;
  state: string;
  currentRound: number;
  maxRounds: number;
  questionId: number | null;
  questionContent: string | null;
  startedAt: string;
  endsAt: string | null;
  alivePlayerCount: number;
}

export interface GameEventMessage {
  roomId: string;
  eventType: string;
  timestamp: number;
  data: Record<string, unknown>;
}

interface StompState {
  client: Client | null;
  connected: boolean;
  gameState: GameStateMessage | null;
  positions: PlayerPosition[];
  lastEvent: GameEventMessage | null;
  connect: (roomId: string, token: string) => void;
  disconnect: () => void;
  sendMove: (roomId: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

export const useStompStore = create<StompState>((set, get) => ({
  client: null,
  connected: false,
  gameState: null,
  positions: [],
  lastEvent: null,

  connect: (roomId: string, token: string) => {
    // If already connected, do not re-init
    if (get().client && get().connected) return;

    const wsUrl = `ws://${window.location.host}/ws/game?token=${token}`;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        set({ connected: true });

        // 1. Subscribe to Room State
        client.subscribe(`/topic/room/${roomId}/state`, (message) => {
          try {
            const data: GameStateMessage = JSON.parse(message.body);
            set({ gameState: data });
          } catch (e) {
            console.error('Failed to parse state broadcast', e);
          }
        });

        // 2. Subscribe to Room Positions Tick
        client.subscribe(`/topic/room/${roomId}/positions`, (message) => {
          try {
            const data = JSON.parse(message.body);
            set({ positions: data.positions ?? [] });
          } catch (e) {
            console.error('Failed to parse positions broadcast', e);
          }
        });

        // 3. Subscribe to Room Events
        client.subscribe(`/topic/room/${roomId}/event`, (message) => {
          try {
            const data: GameEventMessage = JSON.parse(message.body);
            set({ lastEvent: data });
          } catch (e) {
            console.error('Failed to parse event broadcast', e);
          }
        });
      },
      onDisconnect: () => {
        set({ connected: false });
      },
      onStompError: (frame) => {
        console.error('STOMP protocol error', frame);
      },
    });

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.deactivate();
      set({ client: null, connected: false, gameState: null, positions: [], lastEvent: null });
    }
  },

  sendMove: (roomId: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const { client, connected } = get();
    if (client && connected) {
      client.publish({
        destination: '/app/game/move',
        body: JSON.stringify({ roomId, direction }),
      });
    }
  },
}));
