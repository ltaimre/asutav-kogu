"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Paper,
  ScrollArea,
  Button,
  Group,
  SegmentedControl,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { fetchGoogleSheetCsv } from "@/lib/fetchGoogleSheet";
import { GOOGLE_SHEET_CSV_URL } from "@/constants";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

export default function TimelinePage() {
  const [data, setData] = useState([]);
  const [sortKey, setSortKey] = useState("start");
  const [sortAsc, setSortAsc] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGoogleSheetCsv(GOOGLE_SHEET_CSV_URL).then(({ rows }) => {
      const parsed = rows
        .map((row) => {
          const parseDate = (str) => {
            if (!str || !str.includes(".")) return null;
            const [day, month, year] = str.split(".");
            return new Date(year, month - 1, day);
          };

          const start = parseDate(row.AKL_algus);
          const end = parseDate(row.AKL_lõpp);

          if (!start || !end) return null;

          return {
            ...row,
            start,
            end,
            days: Math.floor((end - start) / (1000 * 60 * 60 * 24)),
          };
        })
        .filter(Boolean);

      setData(parsed);
    });
  }, []);

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    if (sortedData.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 150 };
    const width = 1200 - margin.left - margin.right;
    const rowHeight = 22;
    const height = sortedData.length * rowHeight;

    const svg = d3
      .select("#timeline-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.select("g").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain([new Date(1919, 3, 23), new Date(1920, 11, 20)])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.eesnimi + " " + d.perekonnanimi))
      .range([0, height])
      .padding(0.1);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(2))
          .tickFormat(d3.timeFormat("%b %Y"))
      );

    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "6px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    g.selectAll("rect")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.start))
      .attr("y", (d) => y(d.eesnimi + " " + d.perekonnanimi))
      .attr("width", (d) => x(d.end) - x(d.start))
      .attr("height", y.bandwidth())
      .attr("fill", "#4c6ef5")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip
          .html(
            `<strong>${d.eesnimi} ${d.perekonnanimi}</strong><br/>` +
              `Algus: ${d.start.toLocaleDateString()}<br/>` +
              `Lõpp: ${d.end.toLocaleDateString()}<br/>` +
              `Päevi ametis: ${d.days}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  }, [sortedData]);

  return (
    <Container mt="xl">
      <Title order={2} ta="center" mb="md">
        Asutava Kogu liikmete ametis olemise ajaskaala
      </Title>

      <Group justify="space-between" mb="md">
        <Button onClick={() => router.push("/")} variant="outline">
          Tagasi andmetabeli juurde
        </Button>

        <Group>
          <SegmentedControl
            value={sortKey}
            onChange={setSortKey}
            data={[
              { label: "Alguskuupäev", value: "start" },
              { label: "Lõppkuupäev", value: "end" },
              { label: "Ametipäevi", value: "days" },
              { label: "Nimi", value: "perekonnanimi" },
            ]}
          />
          <Button
            onClick={() => setSortAsc((s) => !s)}
            variant="subtle"
            leftSection={
              sortAsc ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />
            }
          >
            {sortAsc ? "Tõusev" : "Langev"}
          </Button>
        </Group>
      </Group>

      <Paper shadow="md" radius="md" p="md" withBorder>
        <ScrollArea>
          <svg id="timeline-svg">
            <g />
          </svg>
        </ScrollArea>
      </Paper>
    </Container>
  );
}
