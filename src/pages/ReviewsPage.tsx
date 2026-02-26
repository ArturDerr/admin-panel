import { useEffect, useMemo, useState } from "react";
import { Badge, Box, HStack, Spinner, Text, useToast } from "@chakra-ui/react";

import type { Review } from "../types";
import { fetchReviews } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ru-RU");
}

export default function ReviewsPage() {
  const toast = useToast();

  const [items, setItems] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      try {
        setIsLoading(true);
        const response = await fetchReviews();

        if (mounted) {
          setItems(response.items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки отзывов";

        toast({
          title: "Не удалось загрузить отзывы",
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

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [toast]);

  const columns = useMemo(
    () => [
      { key: "id", title: "ID" },
      { key: "authorPhone", title: "author_phone" },
      { key: "targetPhone", title: "target_phone" },
      {
        key: "rating",
        title: "rating",
        render: (item: Review) => (
          <Badge colorScheme={item.rating >= 4 ? "green" : "orange"}>
            {item.rating}/5
          </Badge>
        ),
      },
      {
        key: "text",
        title: "text",
        render: (item: Review) => (
          <Text maxW="380px" noOfLines={2}>
            {item.text}
          </Text>
        ),
      },
      {
        key: "createdAt",
        title: "created_at",
        render: (item: Review) => (
          <Text color="#98a1ac">{formatDate(item.createdAt)}</Text>
        ),
      },
    ],
    [],
  );

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Отзывы
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<Review>
        title="Список отзывов"
        items={items}
        columns={columns}
        emptyText={isLoading ? "Загрузка..." : "Отзывы не найдены"}
      />
    </Box>
  );
}
