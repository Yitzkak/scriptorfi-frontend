import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";

const SuperAdminDashboard = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await api.get("/api/superadmin/files/");
                setFiles(response.data || []);
            } catch (err) {
                setError("Failed to fetch files. Please try again.");
            }
        };

        fetchFiles();
    }, []);

    const metrics = useMemo(() => {
        const pending = files.filter((file) => file.status === "Pending").length;
        const review = files.filter((file) => file.status === "In Review").length;
        const completed = files.filter((file) => file.status === "Completed").length;
        const revenue = files.reduce((sum, file) => sum + Number(file.total_cost || 0), 0);
        return { pending, review, completed, revenue };
    }, [files]);

    return (
        <div className="min-h-screen">
            <AdminTopbar title="Admin Overview" />

            <div className="px-6 pb-10">
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    {[
                        { label: "Pending", value: metrics.pending },
                        { label: "In Review", value: metrics.review },
                        { label: "Completed", value: metrics.completed },
                        { label: "Total Revenue", value: `$${metrics.revenue.toFixed(2)}` },
                    ].map((card) => (
                        <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-5">
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent uploads</h2>
                        <p className="text-sm text-gray-500 mt-1">Latest files in the queue.</p>
                        <div className="mt-4 divide-y divide-gray-200">
                            {files.slice(0, 6).map((file) => (
                                <div key={file.id} className="py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {file.user?.email || file.user?.username || "Anonymous"}
                                        </p>
                                    </div>
                                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                                        {file.status}
                                    </span>
                                </div>
                            ))}
                            {files.length === 0 && (
                                <p className="text-sm text-gray-500 py-6">No uploads yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900">Operational notes</h2>
                        <p className="text-sm text-gray-500 mt-1">Quick reminders for the team.</p>
                        <ul className="mt-4 space-y-3 text-sm text-gray-600">
                            <li>Prioritize rush orders in the upload queue.</li>
                            <li>Verify transcript delivery before marking completed.</li>
                            <li>Follow up on unpaid files daily.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
