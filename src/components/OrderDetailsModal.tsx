import {
  Badge,
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { OrderDetails } from "../types";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  isLoading?: boolean;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function getStatusColor(status: OrderDetails["status"]): string {
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between" align="start" spacing={4}>
      <Text color="#98a1ac" minW="170px">
        {label}
      </Text>
      <Text textAlign="right" color="#2b2f36" fontWeight="500">
        {value}
      </Text>
    </HStack>
  );
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  isLoading = false,
}: OrderDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.300" />
      <ModalContent
        bg="#ffffff"
        border="1px solid"
        borderColor="#d9dde3"
        color="#2b2f36"
        borderRadius="none"
      >
        <ModalHeader>Детали заказа</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {isLoading ? (
            <HStack justify="center" py={10} spacing={3}>
              <Spinner thickness="3px" speed="0.7s" color="#7ed957" />
              <Text color="#98a1ac">Загрузка данных заказа...</Text>
            </HStack>
          ) : !order ? (
            <Text color="#98a1ac">Данные заказа недоступны</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="700">
                  Заказ {order.id}
                </Text>
                <Badge
                  colorScheme={getStatusColor(order.status)}
                  px={2}
                  py={1}
                  borderRadius="none"
                >
                  {order.status}
                </Badge>
              </HStack>

              <Box
                border="1px solid"
                borderColor="#d9dde3"
                borderRadius="none"
                p={4}
              >
                <VStack align="stretch" spacing={3}>
                  <Row label="owner_number" value={order.ownerNumber} />
                  <Row label="rental_phone" value={order.rentalPhone} />
                  <Row label="start_date" value={formatDate(order.startDate)} />
                  <Row label="end_date" value={formatDate(order.endDate)} />
                  <Row label="cost" value={formatMoney(order.cost)} />
                  <Row label="tariff" value={order.tariff} />
                </VStack>
              </Box>

              <HStack justify="flex-end">
                <Button onClick={onClose} variant="outline" colorScheme="blue">
                  Закрыть
                </Button>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
