import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
        socket = io(socketUrl, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
        });
    }
    return socket;
}

export function connectSocket(): void {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
}

export function disconnectSocket(): void {
    if (socket?.connected) {
        socket.disconnect();
    }
}

// Order tracking
export function trackOrder(orderId: string): void {
    const s = getSocket();
    s.emit('track-order', orderId);
}

export function stopTrackingOrder(orderId: string): void {
    const s = getSocket();
    s.emit('stop-tracking', orderId);
}

// Listen for rider location updates
export function onRiderLocation(callback: (data: { latitude: number; longitude: number; heading?: number; timestamp: string }) => void): () => void {
    const s = getSocket();
    s.on('rider-location', callback);
    return () => s.off('rider-location', callback);
}

// Listen for order status updates
export function onOrderStatus(callback: (data: { status: string; timestamp: string }) => void): () => void {
    const s = getSocket();
    s.on('order-status', callback);
    return () => s.off('order-status', callback);
}

export default {
    getSocket,
    connectSocket,
    disconnectSocket,
    trackOrder,
    stopTrackingOrder,
    onRiderLocation,
    onOrderStatus,
};
