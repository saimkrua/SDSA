import useOrders from "./hooks/useOrders";

export default function Home() {
  const { loading, orders, deleteOrder } = useOrders();

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-center">
      <h1 className="text-4xl font-bold">Orders</h1>
      <div className="flex flex-col w-1/2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex justify-between items-center p-4 border-b border-gray-200"
          >
            <div>
              <h2 className="text-xl">{order.name}</h2>
              <p>Quantity: {order.quantity}</p>
            </div>
            <button
              onClick={() => deleteOrder(order.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
