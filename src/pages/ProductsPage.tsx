import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import React from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import type { Product, ProductAddon, ProductDetails } from "../types";
import {
  createProduct,
  deleteProduct,
  fetchProductDetails,
  fetchProducts,
} from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

type NewProductForm = {
  ownerPhone: string;
  ownerAddress: string;
  title: string;
  category: string;
  description: string;
  brand: string;
  condition: string;
  minRentalPeriod: string;
  maxRentalPeriod: string;
  pricePerHour: string;
  pricePerDay: string;
  pricePerWeek: string;
  pricePerMonth: string;
  deposit: string;
  productCost: string;
  extensionAvailable: boolean;
  insuranceIncluded: boolean;
  freeCancellation: boolean;
  image1: string | File;
  image2: string | File;
  image3: string | File;
  image4: string | File;
  addonCategory1: string;
  addonTitle1: string;
  addonPrice1: string;
  addonCategory2: string;
  addonTitle2: string;
  addonPrice2: string;
  addonCategory3: string;
  addonTitle3: string;
  addonPrice3: string;
  addonCategory4: string;
  addonTitle4: string;
  addonPrice4: string;
  addonCategory5: string;
  addonTitle5: string;
  addonPrice5: string;
  addonCategory6: string;
  addonTitle6: string;
  addonPrice6: string;
  addonCategory7: string;
  addonTitle7: string;
  addonPrice7: string;
  addonCategory8: string;
  addonTitle8: string;
  addonPrice8: string;
};

function BoolBadge({ value }: { value: boolean }) {
  return (
    <Badge colorScheme={value ? "green" : "red"} variant="subtle">
      {value ? "Да" : "Нет"}
    </Badge>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <HStack justify="space-between" w="full">
      <Text color="#98a1ac">{label}</Text>
      <Text fontWeight="600">{value.toLocaleString("ru-RU")} ₽</Text>
    </HStack>
  );
}

function toNumber(value: string): number {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

function getFormValue(form: NewProductForm, key: keyof NewProductForm): string {
  const value = form[key];
  return typeof value === "string" ? value : "";
}

function getInitialForm(): NewProductForm {
  return {
    ownerPhone: "",
    ownerAddress: "",
    title: "",
    category: "",
    description: "",
    brand: "",
    condition: "",
    minRentalPeriod: "",
    maxRentalPeriod: "",
    pricePerHour: "",
    pricePerDay: "",
    pricePerWeek: "",
    pricePerMonth: "",
    deposit: "",
    productCost: "",
    extensionAvailable: false,
    insuranceIncluded: false,
    freeCancellation: false,
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    addonCategory1: "",
    addonTitle1: "",
    addonPrice1: "",
    addonCategory2: "",
    addonTitle2: "",
    addonPrice2: "",
    addonCategory3: "",
    addonTitle3: "",
    addonPrice3: "",
    addonCategory4: "",
    addonTitle4: "",
    addonPrice4: "",
    addonCategory5: "",
    addonTitle5: "",
    addonPrice5: "",
    addonCategory6: "",
    addonTitle6: "",
    addonPrice6: "",
    addonCategory7: "",
    addonTitle7: "",
    addonPrice7: "",
    addonCategory8: "",
    addonTitle8: "",
    addonPrice8: "",
  };
}

export default function ProductsPage() {
  const toast = useToast();

  const detailsModal = useDisclosure();
  const createModal = useDisclosure();

  const [items, setItems] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(
    null,
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [form, setForm] = useState<NewProductForm>(getInitialForm());
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoadingList(true);
        const data = await fetchProducts();
        if (mounted) {
          setItems(data.items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки товаров";
        toast({
          title: "Не удалось загрузить товары",
          description: message,
          status: "error",
          duration: 2600,
          isClosable: true,
        });
      } finally {
        if (mounted) setLoadingList(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  async function openDetails(item: Product) {
    try {
      setLoadingDetails(true);
      detailsModal.onOpen();
      const details = await fetchProductDetails(item.id);
      setSelectedProduct(details);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка загрузки деталей";
      toast({
        title: "Не удалось открыть детали",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
      detailsModal.onClose();
    } finally {
      setLoadingDetails(false);
    }
  }

  function onOpenCreate() {
    setForm(getInitialForm());
    createModal.onOpen();
  }

  function onChangeForm<K extends keyof NewProductForm>(
    key: K,
    value: NewProductForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const createdPayload = useMemo(() => {
    const images = [form.image1, form.image2, form.image3, form.image4]
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);

    const addons: ProductAddon[] = [];
    for (let i = 1; i <= 8; i++) {
      const category = getFormValue(
        form,
        `addonCategory${i}` as keyof NewProductForm,
      ).trim();
      const title = getFormValue(
        form,
        `addonTitle${i}` as keyof NewProductForm,
      ).trim();
      const price = toNumber(
        getFormValue(form, `addonPrice${i}` as keyof NewProductForm),
      );

      if (category || title || price > 0) {
        addons.push({
          addonCategory: category || "Другое",
          addonTitle: title || "Дополнение",
          addonPrice: price,
        });
      }
    }

    return {
      ownerPhone: form.ownerPhone.trim(),
      ownerAddress: form.ownerAddress.trim(),
      title: form.title.trim(),
      category: form.category.trim(),
      extensionAvailable: form.extensionAvailable,
      insuranceIncluded: form.insuranceIncluded,
      freeCancellation: form.freeCancellation,
      description: form.description.trim(),
      brand: form.brand.trim(),
      condition: form.condition.trim(),
      minRentalPeriod: form.minRentalPeriod.trim(),
      maxRentalPeriod: form.maxRentalPeriod.trim(),
      pricePerHour: toNumber(form.pricePerHour),
      pricePerDay: toNumber(form.pricePerDay),
      pricePerWeek: toNumber(form.pricePerWeek),
      pricePerMonth: toNumber(form.pricePerMonth),
      deposit: toNumber(form.deposit),
      productCost: toNumber(form.productCost),
      productImages: images.length
        ? images
        : [
            'null'
          ],
      addons,
    };
  }, [form]);

  async function submitCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !createdPayload.ownerPhone ||
      !createdPayload.title ||
      !createdPayload.category
    ) {
      toast({
        title: "Заполни обязательные поля",
        description: "Нужны: owner_phone, title, category",
        status: "warning",
        duration: 2400,
        isClosable: true,
      });
      return;
    }

    try {
      setIsCreating(true);

      const formData = new FormData();

      formData.append("productData", JSON.stringify(createdPayload));

      const imageFields = [form.image1, form.image2, form.image3, form.image4];
      imageFields.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`image${index + 1}`, image);
        }
      });

      const created = await createProduct(formData);

      setItems((prev) => [
        {
          id: created.id,
          ownerPhone: created.ownerPhone,
          title: created.title,
          category: created.category,
        },
        ...prev,
      ]);

      toast({
        title: "Товар создан",
        status: "success",
        duration: 2200,
        isClosable: true,
      });

      createModal.onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось создать товар";
      toast({
        title: "Ошибка создания",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(item: Product) {
    const confirmed = window.confirm(
      `Удалить товар ${item.title} (${item.id})?`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await deleteProduct(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));

      toast({
        title: "Товар удалён",
        status: "success",
        duration: 2200,
        isClosable: true,
      });

      if (selectedProduct?.id === item.id) {
        setSelectedProduct(null);
        detailsModal.onClose();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось удалить товар";
      toast({
        title: "Ошибка удаления",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="700">
          Товары
        </Text>
        <Button colorScheme="blue" rounded="none" onClick={onOpenCreate}>
          Создать товар
        </Button>
      </HStack>

      <SimpleSectionTable<Product>
        title="Товары"
        items={items}
        columns={[
          { key: "id", title: "ID" },
          { key: "ownerPhone", title: "owner_phone" },
          { key: "title", title: "title" },
          { key: "category", title: "category" },
        ]}
        onOpenDetails={openDetails}
        rowActions={[
          {
            key: "delete",
            label: "Удалить",
            colorScheme: "red",
            variant: "solid",
            onClick: handleDelete,
            isDisabled: (item) => deletingId === item.id,
          },
        ]}
        detailsButtonText={loadingList ? "..." : "Подробнее"}
        emptyText={loadingList ? "Загрузка..." : "Товары не найдены"}
      />

      {loadingList && (
        <Box mt={4}>
          <HStack spacing={3}>
            <Spinner size="sm" color="#2f80ed" />
            <Text color="#98a1ac">Загружаем список товаров...</Text>
          </HStack>
        </Box>
      )}

      <Modal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.onClose}
        size="6xl"
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
          <ModalHeader color="#2b2f36">Детали товара</ModalHeader>
          <ModalCloseButton color="#98a1ac" />
          <ModalBody pb={6}>
            {loadingDetails || !selectedProduct ? (
              <HStack py={8} spacing={3}>
                <Spinner color="#2f80ed" />
                <Text color="#98a1ac">Загрузка информации...</Text>
              </HStack>
            ) : (
              <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }} gap={6}>
                <GridItem>
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
                          <Text>{selectedProduct.id}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">owner_phone</Text>
                          <Text>{selectedProduct.ownerPhone}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">owner_address</Text>
                          <Text>{selectedProduct.ownerAddress}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">category</Text>
                          <Text>{selectedProduct.category}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">название</Text>
                          <Text>{selectedProduct.title}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">бренд</Text>
                          <Text>{selectedProduct.brand}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">состояние</Text>
                          <Text>{selectedProduct.condition}</Text>
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
                        Параметры аренды
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">Продление</Text>
                          <BoolBadge
                            value={selectedProduct.extensionAvailable}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">Страховка</Text>
                          <BoolBadge
                            value={selectedProduct.insuranceIncluded}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">Бесплатная отмена</Text>
                          <BoolBadge value={selectedProduct.freeCancellation} />
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">Мин. период</Text>
                          <Text>{selectedProduct.minRentalPeriod}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#98a1ac">Макс. период</Text>
                          <Text>{selectedProduct.maxRentalPeriod}</Text>
                        </HStack>
                        <PriceRow
                          label="Цена за час"
                          value={selectedProduct.pricePerHour}
                        />
                        <PriceRow
                          label="Цена за день"
                          value={selectedProduct.pricePerDay}
                        />
                        <PriceRow
                          label="Цена за неделю"
                          value={selectedProduct.pricePerWeek}
                        />
                        <PriceRow
                          label="Цена за месяц"
                          value={selectedProduct.pricePerMonth}
                        />
                        <PriceRow
                          label="Залог"
                          value={selectedProduct.deposit}
                        />
                        <PriceRow
                          label="Стоимость товара"
                          value={selectedProduct.productCost}
                        />
                      </VStack>
                    </Box>

                    <Box
                      border="1px solid"
                      borderColor="#d9dde3"
                      borderRadius="none"
                      p={4}
                      bg="#ffffff"
                    >
                      <Text fontWeight="700" mb={2}>
                        Описание
                      </Text>
                      <Text color="#98a1ac">{selectedProduct.description}</Text>
                    </Box>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={4}>
                    <Box
                      border="1px solid"
                      borderColor="#d9dde3"
                      borderRadius="none"
                      p={4}
                      bg="#ffffff"
                    >
                      <Text fontWeight="700" mb={3}>
                        Фото товара (4)
                      </Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        {selectedProduct.productImages
                          .slice(0, 4)
                          .map((src, idx) => (
                            <Image
                              key={`${src}-${idx}`}
                              src={src}
                              alt={`product-${idx + 1}`}
                              borderRadius="none"
                              h="420px"
                              objectFit="cover"
                              border="1px solid"
                              borderColor="#d9dde3"
                            />
                          ))}
                      </Grid>
                    </Box>

                    <Box
                      border="1px solid"
                      borderColor="#d9dde3"
                      borderRadius="none"
                      p={4}
                      bg="#ffffff"
                    >
                      <Text fontWeight="700" mb={3}>
                        Дополнения
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        {selectedProduct.addons.length === 0 ? (
                          <Text color="#98a1ac">Нет дополнений</Text>
                        ) : (
                          selectedProduct.addons.map((addon, index) => (
                            <Box
                              key={`${addon.addonTitle}-${index}`}
                              border="1px solid"
                              borderColor="#d9dde3"
                              borderRadius="none"
                              p={3}
                            >
                              <HStack justify="space-between" mb={1}>
                                <Text color="#98a1ac" fontSize="sm">
                                  Категория
                                </Text>
                                <Text fontSize="sm">{addon.addonCategory}</Text>
                              </HStack>
                              <HStack justify="space-between" mb={1}>
                                <Text color="#98a1ac" fontSize="sm">
                                  Название
                                </Text>
                                <Text fontSize="sm">{addon.addonTitle}</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text color="#98a1ac" fontSize="sm">
                                  Доп. стоимость
                                </Text>
                                <Text fontSize="sm" fontWeight="600">
                                  {addon.addonPrice.toLocaleString("ru-RU")} ₽
                                </Text>
                              </HStack>
                            </Box>
                          ))
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            )}

            <HStack justify="flex-end" mt={6}>
              <Button
                onClick={detailsModal.onClose}
                colorScheme="blue"
                rounded="none"
                variant="outline"
              >
                Закрыть
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        size="4xl"
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
          <ModalHeader color="#2b2f36">Создать товар</ModalHeader>
          <ModalCloseButton color="#98a1ac" />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={submitCreate}>
              <VStack spacing={4} align="stretch">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired>
                    <FormLabel color="#98a1ac">owner_phone</FormLabel>
                    <Input
                      value={form.ownerPhone}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("ownerPhone", e.target.value)
                      }
                      placeholder="+7 700 000 00 00"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel color="#98a1ac">category</FormLabel>
                    <Input
                      rounded="none"
                      value={form.category}
                      onChange={(e) => onChangeForm("category", e.target.value)}
                      placeholder="Категория"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel color="#98a1ac">title</FormLabel>
                    <Input
                      value={form.title}
                      rounded="none"
                      onChange={(e) => onChangeForm("title", e.target.value)}
                      placeholder="Название"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">owner_address</FormLabel>
                    <Input
                      value={form.ownerAddress}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("ownerAddress", e.target.value)
                      }
                      placeholder="Адрес владельца"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">brand</FormLabel>
                    <Input
                      value={form.brand}
                      rounded="none"
                      onChange={(e) => onChangeForm("brand", e.target.value)}
                      placeholder="Бренд"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">condition</FormLabel>
                    <Input
                      value={form.condition}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("condition", e.target.value)
                      }
                      placeholder="Состояние"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel color="#98a1ac">Описание</FormLabel>
                  <Textarea
                    value={form.description}
                    rounded="none"
                    onChange={(e) =>
                      onChangeForm("description", e.target.value)
                    }
                    placeholder="Описание товара"
                    bg="#ffffff"
                    borderColor="#d9dde3"
                  />
                </FormControl>

                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr" }}
                  gap={4}
                >
                  <FormControl>
                    <FormLabel color="#98a1ac">Мин. период</FormLabel>
                    <Input
                      value={form.minRentalPeriod}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("minRentalPeriod", e.target.value)
                      }
                      placeholder="1 день"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Макс. период</FormLabel>
                    <Input
                      value={form.maxRentalPeriod}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("maxRentalPeriod", e.target.value)
                      }
                      placeholder="30 дней"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Цена/час</FormLabel>
                    <Input
                      value={form.pricePerHour}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("pricePerHour", e.target.value)
                      }
                      placeholder="0"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Цена/день</FormLabel>
                    <Input
                      value={form.pricePerDay}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("pricePerDay", e.target.value)
                      }
                      placeholder="0"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Цена/неделя</FormLabel>
                    <Input
                      value={form.pricePerWeek}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("pricePerWeek", e.target.value)
                      }
                      placeholder="0"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Цена/месяц</FormLabel>
                    <Input
                      value={form.pricePerMonth}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("pricePerMonth", e.target.value)
                      }
                      placeholder="0"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Залог</FormLabel>
                    <Input
                      value={form.deposit}
                      rounded="none"
                      onChange={(e) => onChangeForm("deposit", e.target.value)}
                      placeholder="0"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#98a1ac">Стоимость товара</FormLabel>
                    <Input
                      value={form.productCost}
                      rounded="none"
                      onChange={(e) =>
                        onChangeForm("productCost", e.target.value)
                      }
                      placeholder="0"
                      bg="#ffffff"
                      borderColor="#d9dde3"
                    />
                  </FormControl>
                </Grid>

                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                  bg="#ffffff"
                >
                  <Text fontWeight="700" mb={3}>
                    Фото товара
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr" }}
                    gap={4}
                  >
                    <FormControl>
                      <FormLabel color="#98a1ac">Фото 1</FormLabel>
                      <Input
                        type="file"
                        rounded="none"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChangeForm("image1", file);
                          }
                        }}
                        bg="#ffffff"
                        borderColor="#d9dde3"
                        pt={1}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#98a1ac">Фото 2</FormLabel>
                      <Input
                        type="file"
                        rounded="none"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChangeForm("image2", file);
                          }
                        }}
                        bg="#ffffff"
                        borderColor="#d9dde3"
                        pt={1}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#98a1ac">Фото 3</FormLabel>
                      <Input
                        type="file"
                        rounded="none"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChangeForm("image3", file);
                          }
                        }}
                        bg="#ffffff"
                        borderColor="#d9dde3"
                        pt={1}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#98a1ac">Фото 4</FormLabel>
                      <Input
                        type="file"
                        rounded="none"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChangeForm("image4", file);
                          }
                        }}
                        bg="#ffffff"
                        borderColor="#d9dde3"
                        pt={1}
                      />
                    </FormControl>
                  </Grid>
                </Box>

                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                  bg="#ffffff"
                >
                  <Text fontWeight="700" mb={3}>
                    Дополнения
                  </Text>
                  <Text color="#98a1ac" fontSize="sm" mb={4}>
                    Категория 1: Аксессуары
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                    gap={3}
                  >
                    {Array.from({ length: 4 }).map((_, i) => {
                      const index = i + 1;
                      const titleKey =
                        `addonTitle${index}` as keyof NewProductForm;
                      const priceKey =
                        `addonPrice${index}` as keyof NewProductForm;
                      const categoryKey =
                        `addonCategory${index}` as keyof NewProductForm;
                      return (
                        <React.Fragment key={`addon1-${index}`}>
                          <FormControl>
                            <FormLabel color="#98a1ac">
                              Название {index}
                            </FormLabel>
                            <Input
                              rounded="none"
                              value={getFormValue(form, titleKey)}
                              onChange={(e) =>
                                onChangeForm(titleKey, e.target.value)
                              }
                              placeholder="Штатив"
                              bg="#ffffff"
                              borderColor="#d9dde3"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel color="#98a1ac">Цена {index}</FormLabel>
                            <Input
                              rounded="none"
                              value={getFormValue(form, priceKey)}
                              onChange={(e) =>
                                onChangeForm(priceKey, e.target.value)
                              }
                              placeholder="0"
                              type="number"
                              bg="#ffffff"
                              borderColor="#d9dde3"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel color="#98a1ac">
                              Категория {index}
                            </FormLabel>
                            <Input
                              rounded="none"
                              value={getFormValue(form, categoryKey)}
                              onChange={(e) =>
                                onChangeForm(categoryKey, e.target.value)
                              }
                              placeholder="Аксессуары"
                              bg="#ffffff"
                              borderColor="#d9dde3"
                            />
                          </FormControl>
                        </React.Fragment>
                      );
                    })}
                  </Grid>

                  <Text color="#98a1ac" fontSize="sm" mt={6} mb={4}>
                    Категория 2: Дополнительные услуги
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                    gap={3}
                  >
                    {Array.from({ length: 4 }).map((_, i) => {
                      const index = i + 5;
                      const titleKey =
                        `addonTitle${index}` as keyof NewProductForm;
                      const priceKey =
                        `addonPrice${index}` as keyof NewProductForm;
                      const categoryKey =
                        `addonCategory${index}` as keyof NewProductForm;
                      return (
                        <React.Fragment key={`addon2-${index}`}>
                          <FormControl>
                            <FormLabel color="#98a1ac">
                              Название {index - 4}
                            </FormLabel>
                            <Input
                              rounded="none"
                              value={getFormValue(form, titleKey)}
                              onChange={(e) =>
                                onChangeForm(titleKey, e.target.value)
                              }
                              placeholder="Доставка"
                              bg="#ffffff"
                              borderColor="#d9dde3"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel color="#98a1ac">
                              Цена {index - 4}
                            </FormLabel>
                            <Input
                              rounded="none"
                              value={getFormValue(form, priceKey)}
                              onChange={(e) =>
                                onChangeForm(priceKey, e.target.value)
                              }
                              placeholder="0"
                              type="number"
                              bg="#ffffff"
                              borderColor="#d9dde3"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel color="#98a1ac">
                              Категория {index - 4}
                            </FormLabel>
                            <Input
                              rounded="none"
                              value={getFormValue(form, categoryKey)}
                              onChange={(e) =>
                                onChangeForm(categoryKey, e.target.value)
                              }
                              placeholder="Дополнительные услуги"
                              bg="#ffffff"
                              borderColor="#d9dde3"
                            />
                          </FormControl>
                        </React.Fragment>
                      );
                    })}
                  </Grid>
                </Box>

                <HStack spacing={6} pt={2}>
                  <Checkbox
                    isChecked={form.extensionAvailable}
                    onChange={(e) =>
                      onChangeForm("extensionAvailable", e.target.checked)
                    }
                  >
                    Продление
                  </Checkbox>
                  <Checkbox
                    isChecked={form.insuranceIncluded}
                    onChange={(e) =>
                      onChangeForm("insuranceIncluded", e.target.checked)
                    }
                  >
                    Страховка
                  </Checkbox>
                  <Checkbox
                    isChecked={form.freeCancellation}
                    onChange={(e) =>
                      onChangeForm("freeCancellation", e.target.checked)
                    }
                  >
                    Бесплатная отмена
                  </Checkbox>
                </HStack>

                <HStack justify="flex-end" pt={2}>
                  <Button
                    rounded="none"
                    variant="outline"
                    onClick={createModal.onClose}
                  >
                    Отмена
                  </Button>
                  <Button
                    colorScheme="blue"
                    type="submit"
                    rounded="none"
                    isLoading={isCreating}
                  >
                    Создать
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
