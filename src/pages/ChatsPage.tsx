import { useEffect, useState } from "react";
import { Box, HStack, Spinner, Text, useToast, VStack } from "@chakra-ui/react";
import type { Chat } from "../types";
import { fetchChats } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ru-RU");
}

export default function ChatsPage() {
  const toast = useToast();

  const [items, setItems] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadChats() {
      try {
        setIsLoading(true);
        const response = await fetchChats();
        if (!mounted) return;
        setItems(response.items);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить чаты";

        toast({
          title: "Ошибка",
          description: message,
          status: "error",
          duration: 2600,
          isClosable: true,
        });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadChats();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Чаты
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<Chat>
        title="Список чатов"
        items={items}
        columns={[
          { key: "id", title: "ID" },
          {
            key: "participantPhones",
            title: "Участники",
            render: (item) => (
              <VStack align="start" spacing={0}>
                {item.participantPhones.map((phone) => (
                  <Text key={`${item.id}-${phone}`} fontSize="sm">
                    {phone}
                  </Text>
                ))}
              </VStack>
            ),
          },
          { key: "lastMessage", title: "Последнее сообщение" },
          {
            key: "updatedAt",
            title: "Обновлён",
            render: (item) => (
              <Text fontSize="sm" color="#98a1ac">
                {formatDate(item.updatedAt)}
              </Text>
            ),
          },
        ]}
        emptyText={isLoading ? "Загрузка..." : "Чаты не найдены"}
      />
    </Box>
  );
}
