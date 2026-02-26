import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  HStack,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import type { Order, OrderDetails } from "../types";
import { cancelOrder, fetchOrderDetails, fetchOrders } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";
import OrderDetailsModal from "../components/OrderDetailsModal.tsx";

function getStatusColor(status: Order["status"]): string {
  switch (status) {
    case "active":
      return "green";
    case "pending":
      return "orange";
    case "completed":
      return "blue";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}

export default function OrdersPage() {
  const toast = useToast();
  const detailsDisclosure = useDisclosure();

  const [items, setItems] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setIsLoading(true);
        const response = await fetchOrders();
        if (mounted) {
          setItems(response.items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки заказов";

        toast({
          title: "Не удалось загрузить заказы",
          description: message,
          status: "error",
          duration: 2800,
          isClosable: true,
        });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [toast]);

  async function openDetails(order: Order) {
    try {
      setIsDetailsLoading(true);
      detailsDisclosure.onOpen();

      const details = await fetchOrderDetails(order.id);
      setSelectedOrder(details);
    } catch (error) {
      detailsDisclosure.onClose();

      const message =
        error instanceof Error ? error.message : "Ошибка загрузки деталей";

      toast({
        title: "Не удалось открыть заказ",
        description: message,
        status: "error",
        duration: 2800,
        isClosable: true,
      });
    } finally {
      setIsDetailsLoading(false);
    }
  }

  async function onCancelOrder(order: Order) {
    if (order.status === "cancelled") {
      toast({
        title: "Заказ уже отменён",
        status: "info",
        duration: 1800,
        isClosable: true,
      });
      return;
    }

    try {
      await cancelOrder(order.id);

      setItems((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, status: "cancelled" } : item,
        ),
      );

      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "cancelled" } : prev,
        );
      }

      toast({
        title: "Заказ отменён",
        status: "success",
        duration: 2200,
        isClosable: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка отмены заказа";

      toast({
        title: "Не удалось отменить заказ",
        description: message,
        status: "error",
        duration: 2800,
        isClosable: true,
      });
    }
  }

  function closeDetails() {
    detailsDisclosure.onClose();
    setSelectedOrder(null);
  }

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Заказы
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<Order>
        title="Список заказов"
        items={items}
        onOpenDetails={openDetails}
        rowActions={[
          {
            key: "cancel-order",
            label: "Отменить",
            colorScheme: "orange",
            variant: "outline",
            onClick: onCancelOrder,
            isDisabled: (item) => item.status === "cancelled",
          },
        ]}
        columns={[
          { key: "id", title: "ID" },
          { key: "ownerPhone", title: "owner_phone" },
          { key: "renterPhone", title: "renter_phone" },
          {
            key: "status",
            title: "status",
            render: (item) => (
              <Badge colorScheme={getStatusColor(item.status)}>
                {item.status}
              </Badge>
            ),
          },
        ]}
      />

      <OrderDetailsModal
        isOpen={detailsDisclosure.isOpen}
        onClose={closeDetails}
        order={selectedOrder}
        isLoading={isDetailsLoading}
      />
    </Box>
  );
}
