import { useEffect, useState } from "react";
import { Badge, Box, HStack, Spinner, Text, useToast } from "@chakra-ui/react";
import type { ProductModerationItem } from "../types";
import { fetchProductModeration } from "../api/dashboard";
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

  const [items, setItems] = useState<ProductModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      />
    </Box>
  );
}
