import React, { useState, useEffect } from "react";
import {
  getExpenses,
  createExpense,
  createCategory,
  fetchCategories,
} from "../services/api";
import { Category, CategoryFormData, Expense, ExpenseFormData } from "../types";
import YearNavigation from "../components/YearNavigation";
import { MonthNavigation } from "../components/MonthNavigation";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { CalendarExpenseTable } from "../components/CalendarExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { Modal, Button } from "../vibes";
import { COLORS } from "../constants/colors";
import { CategoryForm } from "../components/CategoryForm";
import { CategoriesTable } from "../components/CategoriesTable";

const CategoriesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoriesFromApi, setCategoriesFromApi] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Get year and month from URL params, default to current date if not provided
  const getInitialYearMonth = () => {
    const params = new URLSearchParams(window.location.search);
    const currentDate = new Date();
    const yearParam = params.get("year");
    const monthParam = params.get("month");

    return {
      year: yearParam ? parseInt(yearParam) : currentDate.getFullYear(),
      month: monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1,
    };
  };

  const initial = getInitialYearMonth();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);

  // Update URL when year or month changes
  const updateURL = (year: number, month: number) => {
    const params = new URLSearchParams();
    params.set("year", year.toString());
    params.set("month", month.toString());
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newURL);
  };

  useEffect(() => {
    fetchCategoriesFromApi();
  }, []);

  const fetchCategoriesFromApi = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategoriesFromApi(data as Category[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      await createCategory(data);
      setIsCategoryModalOpen(false);
      fetchCategoriesFromApi();
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  // Calculate category breakdown
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { category, amount: 0, count: 0 };
    }
    acc[category].amount += Number(expense.amount);
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { category: string; amount: number; count: number }>);

  const categories = Object.values(categoryData).sort(
    (a, b) => b.amount - a.amount
  );
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  const pageStyle: React.CSSProperties = {
    padding: "48px 64px",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    justifyContent: "space-between",
  };

  const leftHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "40px",
    fontWeight: 700,
    color: COLORS.secondary.s10,
    margin: 0,
    flexShrink: 0,
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "48px",
    fontSize: "18px",
    color: COLORS.secondary.s08,
  };

  const rightHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={leftHeaderStyle}>
          <h1 style={titleStyle}>Expense History</h1>
        </div>

        <Button
          variant='primary'
          onClick={() => setIsCategoryModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <div>
        {loading ? (
          <div style={loadingStyle}>Loading...</div>
        ) : (
          <div style={{ marginTop: "32px" }}>
            <CategoriesTable
              categories={categoriesFromApi}
              onCategoryUpdated={fetchCategoriesFromApi}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title='Add New Category'
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default CategoriesPage;
