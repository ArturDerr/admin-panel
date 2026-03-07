import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import type { ProductModerationItem } from "../types";
import {
  approveModerationProduct,
  fetchModerationItemDetails,
  fetchProductModeration,
  rejectModerationProduct,
} from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

function statusColor(status: ProductModerationItem["status"]) {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "pending":
    default:
      return "orange";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

export default function ProductModerationPage() {
  const toast = useToast();

  const {
    isOpen: isDetailsOpen,
    onOpen: openDetailsModal,
    onClose: closeDetailsModal,
  } = useDisclosure();
  const {
    isOpen: isRejectOpen,
    onOpen: openRejectModal,
    onClose: closeRejectModal,
  } = useDisclosure();

  const [items, setItems] = useState<ProductModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] =
    useState<ProductModerationItem | null>(null);
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      try {
        setIsLoading(true);
        const response = await fetchProductModeration();

        if (!mounted) return;
        setItems(response.items);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки модерации";

        toast({
          title: "Не удалось загрузить модерацию товаров",
          description: message,
          status: "error",
          duration: 2600,
          isClosable: true,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadItems();

    return () => {
      mounted = false;
    };
  }, [toast]);

  async function openDetails(item: ProductModerationItem) {
    setSelectedItem(item);
    setDetails(null);
    openDetailsModal();

    try {
      setIsDetailsLoading(true);
      const response = await fetchModerationItemDetails(item.id);
      setDetails(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось загрузить детали товара";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setIsDetailsLoading(false);
    }
  }

  async function handleApprove(item: ProductModerationItem) {
    try {
      setActionLoadingId(item.id);
      await approveModerationProduct(item.productId);

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, status: "approved" } : entry,
        ),
      );

      toast({
        title: "Товар одобрен",
        status: "success",
        duration: 2200,
        isClosable: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось одобрить товар";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  function openReject(item: ProductModerationItem) {
    setSelectedItem(item);
    setRejectComment("");
    openRejectModal();
  }

  async function confirmReject() {
    if (!selectedItem) return;
    const comment = rejectComment.trim();
    if (!comment) {
      toast({
        title: "Нужен комментарий",
        description: "Комментарий обязателен для отклонения",
        status: "warning",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    try {
      setActionLoadingId(selectedItem.id);
      await rejectModerationProduct(selectedItem.productId, { comment });

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === selectedItem.id
            ? { ...entry, status: "rejected" }
            : entry,
        ),
      );

      toast({
        title: "Товар отклонен",
        status: "warning",
        duration: 2200,
        isClosable: true,
      });
      closeRejectModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось отклонить товар";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  const renderDetailValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Модерация товаров
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<ProductModerationItem>
        title="Список модерации"
        items={items}
        columns={[
          { key: "id", title: "ID" },
          { key: "productId", title: "product_id" },
          { key: "ownerPhone", title: "owner_phone" },
          {
            key: "status",
            title: "status",
            render: (item) => (
              <Badge colorScheme={statusColor(item.status)}>
                {item.status}
              </Badge>
            ),
          },
          {
            key: "submittedAt",
            title: "submitted_at",
            render: (item) => <Text>{formatDate(item.submittedAt)}</Text>,
          },
        ]}
        emptyText={isLoading ? "Загрузка..." : "Записей пока нет"}
        onOpenDetails={openDetails}
        detailsButtonText="Подробнее"
        rowActions={[
          {
            key: "approve",
            label: "Одобрить",
            colorScheme: "green",
            variant: "outline",
            onClick: handleApprove,
            isDisabled: (item) => actionLoadingId === item.id,
            isHidden: (item) => item.status === "approved",
          },
          {
            key: "reject",
            label: "Отклонить",
            colorScheme: "red",
            variant: "outline",
            onClick: openReject,
            isDisabled: (item) => actionLoadingId === item.id,
            isHidden: (item) => item.status === "rejected",
          },
        ]}
      />

      <Modal
        isOpen={isDetailsOpen}
        onClose={closeDetailsModal}
        size="xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          bg="#ffffff"
          border="1px solid"
          borderColor="#d9dde3"
          color="#2b2f36"
          borderRadius="none"
        >
          <ModalHeader>
            Детали товара {selectedItem ? `— ${selectedItem.productId}` : ""}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isDetailsLoading ? (
              <HStack justify="center" py={10}>
                <Spinner thickness="3px" speed="0.7s" color="#2f80ed" />
                <Text color="#98a1ac">Загрузка деталей...</Text>
              </HStack>
            ) : details ? (
              <VStack align="stretch" spacing={4}>
                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                  bg="#ffffff"
                >
                  <Text fontWeight="700" mb={3}>
                    Основное
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">ID</Text>
                      <Text>{renderDetailValue(details.id)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Product ID</Text>
                      <Text>{renderDetailValue(details.productId)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Название</Text>
                      <Text>{renderDetailValue(details.title)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Категория</Text>
                      <Text>{renderDetailValue(details.category)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Бренд</Text>
                      <Text>{renderDetailValue(details.brand)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Статус</Text>
                      <Badge
                        colorScheme={statusColor(
                          (details.status as ProductModerationItem["status"]) ?? "pending",
                        )}
                      >
                        {renderDetailValue(details.status)}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>

                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                  bg="#ffffff"
                >
                  <Text fontWeight="700" mb={3}>
                    Цены
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Цена за час</Text>
                      <Text>{renderDetailValue(details.price_per_hour)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Цена за день</Text>
                      <Text>{renderDetailValue(details.price_per_day)}</Text>
                    </HStack>
                  </VStack>
                </Box>
                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                  bg="#ffffff"
                >
                  <Text fontWeight="700" mb={3}>
                    Владелец
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Телефон</Text>
                      <Text>{renderDetailValue(details.ownerPhone)}</Text>
                    </HStack>
                  </VStack>
                </Box>
                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                  bg="#ffffff"
                >
                  <Text fontWeight="700" mb={3}>
                    Модерация
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Отправлено</Text>
                      <Text>
                        {details.submittedAt
                          ? formatDate(details.submittedAt as string)
                          : "—"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#98a1ac">Комментарий</Text>
                      <Text>{renderDetailValue(details.moderation_comment)}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {!!details.description && (
                  <Box
                    border="1px solid"
                    borderColor="#d9dde3"
                    borderRadius="none"
                    p={4}
                    bg="#ffffff"
                  >
                    <Text fontWeight="700" mb={3}>
                      Описание
                    </Text>
                    <Text fontSize="sm" color="#2b2f36" whiteSpace="pre-wrap">
                      {String(details.description)}
                    </Text>
                  </Box>
                )}
              </VStack>
            ) : (
              <Text color="#98a1ac">Данные недоступны</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRejectOpen} onClose={closeRejectModal} isCentered>
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          bg="#ffffff"
          border="1px solid"
          borderColor="#d9dde3"
          color="#2b2f36"
          borderRadius="none"
        >
          <ModalHeader>
            Отклонить товар {selectedItem ? `— ${selectedItem.productId}` : ""}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="#98a1ac">Комментарий</FormLabel>
                <Input
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Причина отклонения"
                  bg="#ffffff"
                  borderColor="#d9dde3"
                  _focus={{
                    borderColor: "#f87171",
                    boxShadow: "0 0 0 1px #f87171",
                  }}
                />
              </FormControl>

              <HStack justify="flex-end">
                <Button
                  variant="outline"
                  colorScheme="gray"
                  onClick={closeRejectModal}
                >
                  Отмена
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmReject}
                  isLoading={
                    selectedItem ? actionLoadingId === selectedItem.id : false
                  }
                >
                  Отклонить
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
