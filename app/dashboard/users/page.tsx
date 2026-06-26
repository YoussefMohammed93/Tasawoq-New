"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import Image from "next/image";

export default function UsersPage() {
  const users = useQuery(api.users.getUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const [isUpdating, setIsUpdating] = useState<Id<"users"> | null>(null);

  const handleRoleChange = async (
    userId: Id<"users">,
    newRole: "user" | "admin"
  ) => {
    if (newRole === "user") {
      const adminCount = users?.filter((u) => u.userRole === "admin").length || 0;
      const userToUpdate = users?.find((u) => u._id === userId);

      if (userToUpdate?.userRole === "admin" && adminCount <= 1) {
        toast.error("عذراً، لا يمكن إتمام هذا الإجراء", {
          description: "يجب أن يحتوي النظام على مدير واحد على الأقل لضمان استمرارية الإدارة.",
        });
        return;
      }
    }

    setIsUpdating(userId);
    try {
      await updateUserRole({ userId, newRole });
      toast.success(
        `تم تغيير دور المستخدم إلى ${newRole === "admin" ? "مدير النظام" : "مستخدم"}`
      );
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث دور المستخدم");
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-14 mb-8">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-2">
          إدارة أدوار المستخدمين وصلاحياتهم
        </p>
      </div>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
          <CardDescription>
            قائمة بجميع المستخدمين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-x-auto">
          {users === undefined ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 m-6 bg-muted rounded-lg border-2 border-dashed">
              <div className="space-y-3">
                <p className="text-foreground/80 text-lg font-medium">
                  لا يوجد مستخدمين
                </p>
                <p className="text-sm text-muted-foreground/80">
                  لم يتم العثور على أي مستخدمين مسجلين في النظام
                </p>
              </div>
            </div>
          ) : (
            <Table dir="rtl" className="whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    البريد الإلكتروني
                  </TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border">
                          <Image
                            src={user.imageUrl || "/avatar.png"}
                            alt={user.firstName || "صورة المستخدم"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground md:hidden">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.userRole === "admin" ? "default" : "outline"
                        }
                      >
                        {user.userRole === "admin" ? "مدير النظام" : "مستخدم"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.userRole === "admin" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user._id, "user")}
                          disabled={isUpdating === user._id}
                        >
                          {isUpdating === user._id
                            ? "جاري التحديث..."
                            : "تغيير إلى مستخدم"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user._id, "admin")}
                          disabled={isUpdating === user._id}
                        >
                          {isUpdating === user._id
                            ? "جاري التحديث..."
                            : "تغيير إلى مدير"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
