import { useEffect, useState } from "react";

type FailureData = {
  failure_category: string;
  failure_count: number;
};

type Props = {
  customerId: number;
};

const TopFailuresWidget = ({ customerId }: Props) => {
  const [data, setData] = useState<FailureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/analytics/top-failures/${customerId}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        return res.json();
      })
      .then((result) => {

        // Optional delay for visible loading state
        setTimeout(() => {
          setData(result);
          setLoading(false);
        }, 1500);

      })
      .catch((error) => {
        console.error(error);

        setError("Failed to fetch analytics data.");
        setLoading(false);
      });
  }, [customerId]);

  // Loading State

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">

        <div className="mb-6 h-7 w-56 animate-pulse rounded bg-gray-200"></div>

        <div className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>

              <div className="h-3 w-full animate-pulse rounded-full bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-2xl">

        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Top Failure Categories
        </h2>

        <div className="rounded-xl bg-red-50 p-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  // Empty State
  if (data.length === 0) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">

        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Top Failure Categories
        </h2>

        <div className="rounded-xl bg-gray-50 p-5">
          <p className="text-gray-500">
            No failure patterns detected — this customer is in great shape.
          </p>
        </div>
      </div>
    );
  }

  // Populated State
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02]">

      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        Top Failure Categories
      </h2>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.failure_category}>

            <div className="mb-2 flex items-center justify-between">

              <span className="font-medium capitalize text-gray-700">
                {item.failure_category.replace(/_/g, " ")}
              </span>

              <span className="text-sm font-semibold text-gray-500">
                {item.failure_count}
              </span>

            </div>

            <div className="h-3 w-full rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-blue-500 transition-all duration-700 hover:bg-blue-600"
                style={{
                  width: `${item.failure_count * 30}%`,
                }}
              />

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopFailuresWidget;