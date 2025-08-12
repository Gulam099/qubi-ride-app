import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useUser } from "@clerk/clerk-expo";
import { Loader, LoaderPage } from "@/components/loader";
import { useRouter } from "expo-router";
import { ApiUrl } from "@/const";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export default function PaymentsList() {
  const { user } = useUser();
  const id = user?.publicMetadata.dbPatientId as string;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  
  // Check if current language is Arabic
  const isArabic = i18n.language === 'ar' || I18nManager.isRTL;

  const { data, isLoading, error } = useQuery({
    queryKey: ["all-invoices", id],
    queryFn: async () => {
      const res = await axios.get(`${ApiUrl}/api/payments/get/${id}/all`);
      return res.data;
    },
    enabled: !!id,
  });

  const allInvoices = data?.data ?? [];

  if (isLoading) return <LoaderPage />;
  if (error)
    return (
      <Text className="text-red-500 mt-5 text-center">
        {t("failedToLoadInvoices")}
      </Text>
    );

  return (
    <View className="flex-1 bg-blue-50/10 px-4 pt-4">
      <Text className={`text-lg font-semibold mb-3 ${isArabic ? 'text-right' : 'text-left'}`}>
        {t("myInvoices")}
      </Text>

      <FlatList
        data={allInvoices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <InvoiceCard invoice={item} isArabic={isArabic} />}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">
            {t("noInvoicesFound")}
          </Text>
        }
      />
    </View>
  );
}

// 🔸 Invoice Card
const InvoiceCard = ({ invoice, isArabic }: any) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = async () => {
    if (invoice.status === "paid") {
      router.push(`/account/invoice/${invoice._id}`);
    } else if (invoice.status === "pending") {
      try {
        const response = await fetch(`${ApiUrl}/api/payments/${invoice._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        console.log("result", result);
        if (response.ok && result?.redirectUrl) {
          router.push(
            `/(stacks)/fatoorah/MyFatoorahWebView?redirectUrl=${encodeURIComponent(
              result.redirectUrl
            )}`
          );
        } else {
          alert(result?.error || "Redirect URL not found");
        }
      } catch (err) {
        console.error("Redirect error", err);
        alert("Something went wrong. Try again.");
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-[#DDF9E5] text-green-500";
      case "pending":
        return "bg-[#D2F7F8] text-blue-500";
      case "cancel":
        return "bg-[#F8D2D2] text-red-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("paid") || "Paid";
      case "pending":
        return t("pending") || "Pending";
      case "cancel":
        return t("cancelled") || "Cancelled";
      default:
        return status;
    }
  };

  // Render side label for LTR (left side)
  const renderLeftSideLabel = () => (
    <View 
      style={{
        width: 32,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        height: 120,
      }}
    >
      <View
        style={{
          transform: [{ rotate: '-90deg' }],
          width: 80,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text 
          style={{
            color: 'white',
            fontSize: 11,
            fontWeight: '500',
            textAlign: 'center',
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {invoice.description || 'Invoice'}
        </Text>
      </View>
    </View>
  );

  // Render side label for RTL (right side)
  const renderRightSideLabel = () => (
    <View 
      style={{
        width: 32,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        height: 120,
      }}
    >
      <View
        style={{
          transform: [{ rotate: '90deg' }],
          width: 80,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text 
          style={{
            color: 'white',
            fontSize: 11,
            fontWeight: '500',
            textAlign: 'center',
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {invoice.description || 'Invoice'}
        </Text>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={invoice.status === "cancel"}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: 'row',
        height: 120,
        overflow: 'hidden',
      }}
    >
      {/* Conditional rendering based on language direction */}
      {isArabic ? (
        <>
          {/* Main Content for Arabic */}
          <View style={{ flex: 1, padding: 16, flexDirection: 'row' }}>
            {/* Right side content for Arabic */}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1F2937',
                  textAlign: 'right',
                  marginBottom: 8,
                }}
                numberOfLines={1}
              >
                {invoice.doctorId?.full_name}
              </Text>
              
              <Text 
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  textAlign: 'right',
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {t("typeConsultation")} : {invoice.doctorId?.specialization}
              </Text>
              
              <Text 
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  textAlign: 'right',
                }}
                numberOfLines={1}
              >
                {t("paymentId")} : {invoice.paymentId}
              </Text>
            </View>

            {/* Status and Date for Arabic */}
            <View style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginRight: 12 }}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: invoice.status === 'paid' ? '#DDF9E5' : 
                                 invoice.status === 'pending' ? '#D2F7F8' : '#F8D2D2'
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: invoice.status === 'paid' ? '#10B981' : 
                           invoice.status === 'pending' ? '#3B82F6' : '#EF4444',
                    textAlign: 'center',
                  }}
                >
                  {getStatusText(invoice.status)}
                </Text>
              </View>
              
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                {format(new Date(invoice.paidAt ?? invoice.createdAt), "dd MMM")}
              </Text>
            </View>
          </View>
          
          {/* Right Side Label for Arabic */}
          {renderRightSideLabel()}
        </>
      ) : (
        <>
          {/* Left Side Label for English */}
          {renderLeftSideLabel()}
          
          {/* Main Content for English */}
          <View style={{ flex: 1, padding: 16, flexDirection: 'row' }}>
            {/* Left side content for English */}
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: 8,
                }}
                numberOfLines={1}
              >
                {invoice.doctorId?.full_name}
              </Text>
              
              <Text 
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {t("typeConsultation")} : {invoice.doctorId?.specialization}
              </Text>
              
              <Text 
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                }}
                numberOfLines={1}
              >
                {t("paymentId")} : {invoice.paymentId}
              </Text>
            </View>

            {/* Status and Date for English */}
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: invoice.status === 'paid' ? '#DDF9E5' : 
                                 invoice.status === 'pending' ? '#D2F7F8' : '#F8D2D2'
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: invoice.status === 'paid' ? '#10B981' : 
                           invoice.status === 'pending' ? '#3B82F6' : '#EF4444',
                    textAlign: 'center',
                  }}
                >
                  {getStatusText(invoice.status)}
                </Text>
              </View>
              
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                {format(new Date(invoice.paidAt ?? invoice.createdAt), "dd MMM")}
              </Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};