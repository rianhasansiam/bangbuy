"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  patchAdminOrder,
  setAdminOrders,
  setAdminOrdersError,
  setAdminOrdersLoading,
} from "@/store/slices/admin-orders.slice";
import type { AppDispatch, RootState } from "@/store";
import {
  EMPTY_ADMIN_ORDER_DRAFT,
  fetchAllAdminOrderCustomers,
  fetchAllAdminOrdersSnapshot,
  placeAdminOrder,
  patchOrderStatus,
  patchPaymentStatus,
  previewAdminOrder,
  type AdminOrderCustomer,
  type AdminOrderDraft,
  type AdminOrderRow,
  type OrderStatus,
  type PaymentStatus,
} from "@/features/admin-orders/api";
import {
  fetchAllProductsSnapshot,
  type AdminProduct,
} from "@/features/admin-products/api";
import type { CheckoutPreview } from "@/features/checkout/api";
import { downloadOrderPdf } from "@/features/orders/pdf";
import type { OrderDetail } from "@/features/orders/api";
import {
  confirmMajorAction,
  notifyActionError,
  notifyActionSuccess,
} from "@/lib/admin-feedback";

import OrderSummaryCards from "./components/OrderSummaryCards";
import AdminOrderDrawer from "./components/AdminOrderDrawer";
import OrdersToolbar from "./components/OrdersToolbar";
import OrdersTable from "./components/OrdersTable";

type StatusFilter = "ALL" | OrderStatus;
type PaymentFilter = "ALL" | PaymentStatus;

function freshOrderDraft(): AdminOrderDraft {
  return { ...EMPTY_ADMIN_ORDER_DRAFT, items: [] };
}

export default function AdminOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector((state: RootState) => state.adminOrders.items);
  const isLoading = useSelector(
    (state: RootState) => state.adminOrders.isLoading,
  );
  const isHydrated = useSelector(
    (state: RootState) => state.adminOrders.isHydrated,
  );
  const error = useSelector((state: RootState) => state.adminOrders.error);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");

  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [orderCustomers, setOrderCustomers] = useState<AdminOrderCustomer[]>([]);
  const [orderProducts, setOrderProducts] = useState<AdminProduct[]>([]);
  const [isOrderCatalogLoading, setIsOrderCatalogLoading] = useState(false);
  const [orderCatalogError, setOrderCatalogError] = useState<string | null>(null);
  const [orderDraft, setOrderDraft] = useState<AdminOrderDraft>(freshOrderDraft);
  const [orderPreview, setOrderPreview] = useState<CheckoutPreview | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderDetail | null>(null);
  const [orderFormError, setOrderFormError] = useState<string | null>(null);
  const [isPreviewingOrder, setIsPreviewingOrder] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const refreshOrders = useCallback(async () => {
    dispatch(setAdminOrdersLoading(true));
    dispatch(setAdminOrdersError(null));
    try {
      const items = await fetchAllAdminOrdersSnapshot();
      dispatch(setAdminOrders(items));
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load orders.";
      dispatch(setAdminOrdersError(message));
    } finally {
      dispatch(setAdminOrdersLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (isHydrated) return;
    void refreshOrders();
  }, [isHydrated, refreshOrders]);

  const loadOrderCatalog = useCallback(async () => {
    setIsOrderCatalogLoading(true);
    setOrderCatalogError(null);
    try {
      const [customers, products] = await Promise.all([
        fetchAllAdminOrderCustomers(),
        fetchAllProductsSnapshot(),
      ]);
      setOrderCustomers(customers);
      setOrderProducts(products);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load customers and products.";
      setOrderCatalogError(message);
    } finally {
      setIsOrderCatalogLoading(false);
    }
  }, []);

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchQuery =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        (order.user?.email ?? "").toLowerCase().includes(q) ||
        (order.user?.name ?? "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      const matchPayment =
        paymentFilter === "ALL" || order.paymentStatus === paymentFilter;

      return matchQuery && matchStatus && matchPayment;
    });
  }, [orders, paymentFilter, query, statusFilter]);

  const totals = useMemo(() => {
    let revenue = 0;
    let pending = 0;
    let unpaid = 0;
    for (const order of orders) {
      if (order.status !== "CANCELLED") revenue += order.totalAmount;
      if (order.status === "PENDING") pending += 1;
      if (order.paymentStatus === "UNPAID" && order.status !== "CANCELLED") {
        unpaid += 1;
      }
    }
    return { revenue, pending, unpaid };
  }, [orders]);

  const handleChangeStatus = async (
    order: AdminOrderRow,
    next: OrderStatus,
  ) => {
    if (next === "CANCELLED") {
      const confirmed = await confirmMajorAction({
        title: `Cancel order ${order.orderNumber}?`,
        description:
          "This will mark the order as cancelled and stop further processing.",
        confirmLabel: "Cancel order",
        variant: "danger",
      });
      if (!confirmed) return;
    }

    setMutationError(null);
    setSuccessNote(null);
    setBusyOrderId(order.id);
    try {
      await patchOrderStatus(order.id, next);
      dispatch(
        patchAdminOrder({
          id: order.id,
          changes: { status: next, updatedAt: new Date().toISOString() },
        }),
      );
      const message = `Order ${order.orderNumber} moved to ${next}.`;
      setSuccessNote(message);
      notifyActionSuccess(message);
    } catch (mutation) {
      const message =
        mutation instanceof Error ? mutation.message : "Failed to update status.";
      setMutationError(message);
      notifyActionError(mutation, "Failed to update status.");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleTogglePayment = async (order: AdminOrderRow) => {
    const next: PaymentStatus = order.paymentStatus === "PAID" ? "UNPAID" : "PAID";
    const confirmed = await confirmMajorAction({
      title:
        next === "PAID"
          ? `Confirm payment for ${order.orderNumber}?`
          : `Mark ${order.orderNumber} as unpaid?`,
      description:
        next === "PAID"
          ? "This marks the order as paid."
          : "This will remove the paid flag from this order.",
      confirmLabel: next === "PAID" ? "Confirm payment" : "Mark unpaid",
      variant: next === "PAID" ? "success" : "warning",
    });
    if (!confirmed) return;

    setMutationError(null);
    setSuccessNote(null);
    setBusyOrderId(order.id);
    try {
      await patchPaymentStatus(order.id, next);
      dispatch(
        patchAdminOrder({
          id: order.id,
          changes: {
            paymentStatus: next,
            updatedAt: new Date().toISOString(),
          },
        }),
      );
      const message = `Order ${order.orderNumber} marked as ${next.toLowerCase()}.`;
      setSuccessNote(message);
      notifyActionSuccess(message);
    } catch (mutation) {
      const message =
        mutation instanceof Error
          ? mutation.message
          : "Failed to update payment status.";
      setMutationError(message);
      notifyActionError(mutation, "Failed to update payment status.");
    } finally {
      setBusyOrderId(null);
    }
  };

  const openOrderDrawer = () => {
    setOrderDrawerOpen(true);
    setOrderDraft(freshOrderDraft());
    setOrderPreview(null);
    setPlacedOrder(null);
    setOrderFormError(null);
    void loadOrderCatalog();
  };

  const closeOrderDrawer = () => {
    if (isPlacingOrder) return;
    setOrderDrawerOpen(false);
    setOrderFormError(null);
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = orderCustomers.find((item) => item.id === customerId);
    setOrderPreview(null);
    setOrderDraft((current) => ({
      ...current,
      customerId,
      customerName: customer?.name ?? "",
      customerPhone: customer?.phone ?? "",
      customerEmail: customer?.email ?? "",
      customerCity: customer?.city ?? "",
    }));
  };

  const validateOrderDraft = (): string | null => {
    if (orderDraft.customerName.trim().length < 2) {
      return "Customer name must contain at least 2 characters.";
    }
    if (orderDraft.customerPhone.trim().length < 7) {
      return "Customer phone must contain at least 7 characters.";
    }
    if (orderDraft.customerAddress.trim().length < 5) {
      return "Enter a delivery address with at least 5 characters.";
    }
    if (orderDraft.items.length === 0) return "Add at least one product.";
    return null;
  };

  const handlePreviewOrder = async () => {
    const validationError = validateOrderDraft();
    if (validationError) {
      setOrderFormError(validationError);
      return;
    }
    const advancePayment = Number(orderDraft.advancePayment || 0);
    if (!Number.isFinite(advancePayment) || advancePayment < 0) {
      setOrderFormError("Advance payment must be a non-negative number.");
      return;
    }

    setOrderFormError(null);
    setIsPreviewingOrder(true);
    try {
      const quote = await previewAdminOrder({
        items: orderDraft.items,
        deliveryZone: orderDraft.deliveryZone,
        promoCode: orderDraft.promoCode.trim() || null,
      });
      setOrderPreview(quote);
    } catch (previewError) {
      const message =
        previewError instanceof Error
          ? previewError.message
          : "Failed to calculate the order total.";
      setOrderFormError(message);
    } finally {
      setIsPreviewingOrder(false);
    }
  };

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateOrderDraft();
    if (validationError) {
      setOrderFormError(validationError);
      return;
    }
    const advancePayment = Number(orderDraft.advancePayment || 0);
    if (!Number.isFinite(advancePayment) || advancePayment < 0) {
      setOrderFormError("Advance payment must be a non-negative number.");
      return;
    }

    setOrderFormError(null);
    setIsPlacingOrder(true);
    try {
      const result = await placeAdminOrder({
        customerId: orderDraft.customerId,
        customerName: orderDraft.customerName.trim(),
        customerPhone: orderDraft.customerPhone.trim(),
        customerEmail: orderDraft.customerEmail.trim(),
        customerAddress: orderDraft.customerAddress.trim(),
        customerCity: orderDraft.customerCity.trim(),
        deliveryZone: orderDraft.deliveryZone,
        customerPostalCode: orderDraft.customerPostalCode.trim(),
        customerNote: orderDraft.customerNote.trim(),
        paymentMethod: orderDraft.paymentMethod,
        promoCode: orderDraft.promoCode.trim() || null,
        items: orderDraft.items,
        advancePayment,
      });
      setPlacedOrder(result.order);
      setOrderPreview(null);
      await refreshOrders();
      const message = `Order ${result.order.orderNumber} placed successfully.`;
      setSuccessNote(message);
      notifyActionSuccess(message);
    } catch (placementError) {
      const message =
        placementError instanceof Error
          ? placementError.message
          : "Failed to place the order.";
      setOrderFormError(message);
      notifyActionError(placementError, "Failed to place the order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!placedOrder) return;
    setIsDownloadingPdf(true);
    try {
      await downloadOrderPdf(placedOrder);
    } catch (pdfError) {
      const message =
        pdfError instanceof Error ? pdfError.message : "Failed to generate PDF.";
      setOrderFormError(message);
      notifyActionError(pdfError, "Failed to generate PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const createAnotherOrder = () => {
    setOrderDraft(freshOrderDraft());
    setOrderPreview(null);
    setPlacedOrder(null);
    setOrderFormError(null);
    void loadOrderCatalog();
  };

  return (
    <section className="space-y-4">
      <OrderSummaryCards
        totalOrders={orders.length}
        revenue={totals.revenue}
        pending={totals.pending}
        unpaid={totals.unpaid}
      />

      <OrdersToolbar
        query={query}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        visibleCount={visibleOrders.length}
        totalCount={orders.length}
        isLoading={isLoading}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
        onPaymentChange={setPaymentFilter}
        onRefresh={() => {
          void refreshOrders();
        }}
        onCreate={openOrderDrawer}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mutationError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {mutationError}
        </div>
      )}

      {successNote && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successNote}
        </div>
      )}

      <OrdersTable
        orders={visibleOrders}
        isLoading={isLoading}
        totalCount={orders.length}
        busyOrderId={busyOrderId}
        expandedId={expandedId}
        onToggleExpand={setExpandedId}
        onChangeStatus={(order, next) => {
          void handleChangeStatus(order, next);
        }}
        onTogglePayment={(order) => {
          void handleTogglePayment(order);
        }}
      />

      <AdminOrderDrawer
        open={orderDrawerOpen}
        customers={orderCustomers}
        products={orderProducts}
        isCatalogLoading={isOrderCatalogLoading}
        catalogError={orderCatalogError}
        draft={orderDraft}
        preview={orderPreview}
        placedOrder={placedOrder}
        error={orderFormError}
        isPreviewing={isPreviewingOrder}
        isSubmitting={isPlacingOrder}
        isDownloadingPdf={isDownloadingPdf}
        onClose={closeOrderDrawer}
        onDraftChange={(next) => {
          setOrderPreview(null);
          setOrderDraft(next);
        }}
        onCustomerChange={handleCustomerChange}
        onPreview={() => {
          void handlePreviewOrder();
        }}
        onSubmit={(event) => {
          void handlePlaceOrder(event);
        }}
        onDownloadPdf={() => {
          void handleDownloadPdf();
        }}
        onCreateAnother={createAnotherOrder}
      />
    </section>
  );
}
