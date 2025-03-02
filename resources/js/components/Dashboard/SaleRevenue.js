import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const SaleRevenue = () => {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        datasets: [
            {
                label: "Sales Revenue",
                data: [4000, 3000, 2000, 2500],
                backgroundColor: "#2ecc71",
                borderColor: "#27ae60",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Revenue ($)" },
            },
            x: { title: { display: true, text: "Month" } },
        },
    };

    return <Bar data={data} options={options} />;
};

export default SaleRevenue;
