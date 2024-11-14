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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupSocket = () => {
      const socket = io(
        process.env.NEXT_PUBLIC_KITCHEN_URL || "sdsa-kitchen:3000"
      );
      ioRef.current = socket;

      socket.on("connect", () => {
        socket.emit("get_orders");
        setError(null); // Clear error on successful connection
      });

      socket.on("orders", (orders: Order[]) => {
        setOrders(orders);
        setLoading(false); // Stop loading when we get the orders
        console.log(orders);
      });

      socket.on("connect_error", () => {
        setError("Failed to connect to the server");
        setLoading(false); // Stop loading if there’s an error
      });

      socket.on("order_added", (order: Order) => {
        setOrders((prevOrders) => [order, ...prevOrders]);
      });

      socket.on("order_deleted", (id: string) => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== id)
        );
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
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    ioRef.current?.emit("delete_order", id);
  }

  return { loading, error, orders, deleteOrder };
}
