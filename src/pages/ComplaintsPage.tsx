import { useEffect, useState } from "react";
import { Badge, Box, HStack, Spinner, Text, useToast } from "@chakra-ui/react";

import type { Complaint } from "../types";
import { fetchComplaints } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

function getStatusColor(status: Complaint["status"]): string {
  switch (status) {
    case "new":
      return "orange";
    case "in_progress":
      return "blue";
    case "resolved":
      return "green";
    case "rejected":
      return "red";
    default:
      return "gray";
  }
}

export default function ComplaintsPage() {
  const toast = useToast();

  const [items, setItems] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadComplaints() {
      try {
        setIsLoading(true);
        const response = await fetchComplaints();

        if (mounted) {
          setItems(response.items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки жалоб";

        toast({
          title: "Не удалось загрузить жалобы",
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

    loadComplaints();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Жалобы
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<Complaint>
        title="Список жалоб"
        items={items}
        columns={[
          { key: "id", title: "ID" },
          { key: "fromPhone", title: "from_phone" },
          { key: "againstPhone", title: "against_phone" },
          { key: "reason", title: "reason" },
          {
            key: "status",
            title: "status",
            render: (item) => (
              <Badge colorScheme={getStatusColor(item.status)}>
                {item.status}
              </Badge>
            ),
          },
          { key: "createdAt", title: "created_at" },
        ]}
        emptyText={isLoading ? "Загрузка..." : "Жалобы не найдены"}
      />
    </Box>
  );
}
