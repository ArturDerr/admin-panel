import { useEffect, useMemo, useState } from "react";
import { Badge, Box, HStack, Spinner, Text, useToast } from "@chakra-ui/react";
import type { Ban } from "../types";
import { fetchBans } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("ru-RU");
}

export default function BansPage() {
  const toast = useToast();

  const [items, setItems] = useState<Ban[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBans() {
      try {
        setIsLoading(true);
        const response = await fetchBans();
        if (!mounted) return;
        setItems(response.items);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить баны";

        toast({
          title: "Ошибка",
          description: message,
          status: "error",
          duration: 2600,
          isClosable: true,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadBans();

    return () => {
      mounted = false;
    };
  }, [toast]);

  const columns = useMemo(
    () => [
      { key: "id", title: "ID" },
      { key: "phone", title: "Телефон" },
      { key: "reason", title: "Причина" },
      {
        key: "startDate",
        title: "Начало",
        render: (item: Ban) => formatDate(item.startDate),
      },
      {
        key: "endDate",
        title: "Конец",
        render: (item: Ban) => formatDate(item.endDate),
      },
      {
        key: "active",
        title: "Статус",
        render: (item: Ban) => (
          <Badge colorScheme={item.active ? "green" : "gray"}>
            {item.active ? "Активен" : "Неактивен"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Баны
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<Ban>
        title="Список банов"
        items={items}
        columns={columns}
        emptyText={isLoading ? "Загрузка..." : "Список банов пуст"}
      />
    </Box>
  );
}
