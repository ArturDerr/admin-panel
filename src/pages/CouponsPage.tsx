import { useEffect, useState } from "react";
import { Badge, Box, HStack, Spinner, Text, useToast } from "@chakra-ui/react";
import type { Coupon } from "../types";
import { fetchCoupons } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

export default function CouponsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCoupons() {
      try {
        setIsLoading(true);
        const response = await fetchCoupons();
        if (mounted) {
          setItems(response.items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки купонов";
        toast({
          title: "Не удалось загрузить купоны",
          description: message,
          status: "error",
          duration: 2500,
          isClosable: true,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCoupons();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Text fontSize="xl" fontWeight="700">
          Купоны
        </Text>
        {isLoading && <Spinner size="sm" color="#2f80ed" />}
      </HStack>

      <SimpleSectionTable<Coupon>
        title="Список купонов"
        items={items}
        columns={[
          { key: "id", title: "ID" },
          { key: "code", title: "code" },
          {
            key: "discountPercent",
            title: "discount",
            render: (item) => `${item.discountPercent}%`,
          },
          {
            key: "isActive",
            title: "status",
            render: (item) => (
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "active" : "inactive"}
              </Badge>
            ),
          },
        ]}
        emptyText={isLoading ? "Загрузка..." : "Купоны не найдены"}
      />
    </Box>
  );
}
