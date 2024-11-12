import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Order {
  id: string;
  name: string;
  quantity: number;
}

export default function useOrders() {
  const ioRef = useRef<null | Socket>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const setupSocket = () => {
      const socket = io("sdsa-kitchen:3000");
      ioRef.current = socket;

      socket.on("connect", () => {
        setLoading(false);
      });

      socket.on("order_added", (order: Order) => {
        setOrders([order, ...orders]);
      });

      socket.on("order_deleted", (id: string) => {
        setOrders(orders.filter((order) => order.id !== id));
      });

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, []);

  function deleteOrder(id: string) {
    setOrders(orders.filter((order) => order.id !== id));
    ioRef.current?.emit("delete_order", id);
  }

  return { loading, orders, deleteOrder };
}
