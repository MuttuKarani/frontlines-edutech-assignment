import { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from "react-icons/fa";

import ReusableTable from "../Generic/ReusableTable";
import "../../styles/CompaniesDirectory.css";

const CompaniesDirectory = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load data
  useEffect(() => {
    fetch("/companies.json")
      .then((res) => {
        if (!res.ok) throw new Error("Cannot load companies.json");
        return res.json();
      })
      .then((data) => setCompanies(data))
      .catch(() => setError("Failed to load companies"))
      .finally(() => setLoading(false));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Dropdown unique values
  const locations = [...new Set(companies.map((c) => c.location))];
  const industries = [...new Set(companies.map((c) => c.industry))];

  // Filtering
  const filtered = useMemo(() => {
    return companies
      .filter((c) =>
        [c.name, c.industry, c.location]
          .join(" ")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      )
      .filter((c) => (locationFilter ? c.location === locationFilter : true))
      .filter((c) => (industryFilter ? c.industry === industryFilter : true));
  }, [companies, debouncedSearch, locationFilter, industryFilter]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Sorting function
  const changeSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Skeleton loader
  if (loading)
    return (
      <div>
        <h2 className="mb-3 text-primary fw-bold">Companies Directory</h2>

        <div className="card p-4 shadow-sm card-shadow">
          <h4 className="placeholder-glow">
            <span className="placeholder col-6 bg-primary"></span>
          </h4>
          <div className="placeholder-glow">
            <span className="placeholder col-12 mb-2"></span>
            <span className="placeholder col-12 mb-2"></span>
            <span className="placeholder col-12 mb-2"></span>
          </div>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  // Table columns
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "industry", label: "Industry", sortable: true },
    { key: "location", label: "Location", sortable: true },
    { key: "employees", label: "Employees", sortable: true },
    {
      key: "website",
      label: "Website",
      sortable: false,
      render: (row) => (
        <a
          href={row.website}
          target="_blank"
          rel="noreferrer"
          className="text-secondary fw-semibold"
        >
          Visit <FaExternalLinkAlt size={12} />
        </a>
      ),
    },
  ];

  return (
    <div>
      {/* PAGE HEADING OUTSIDE CARD */}
      <h2 className="mb-4 text-primary fw-bold">Companies Directory</h2>

      <div className="card p-3 shadow-sm card-shadow">
        {/* RESPONSIVE FILTERS */}
        <div className="row g-3 mb-3">
          {/* SEARCH */}
          <div className="col-12 col-sm-6 col-md-4">
            <div className="input-group">
              <span className="input-group-text text-primary">
                <FaSearch />
              </span>
              <input
                className="form-control"
                placeholder="Search Companies..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          {/* LOCATION FILTER */}
          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select"
              value={locationFilter}
              onChange={(e) => {
                setPage(1);
                setLocationFilter(e.target.value);
              }}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* INDUSTRY FILTER */}
          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select"
              value={industryFilter}
              onChange={(e) => {
                setPage(1);
                setIndustryFilter(e.target.value);
              }}
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <ReusableTable
            data={pageItems}
            columns={columns}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={changeSort}
          />
        </div>

        {/* PAGINATION */}
        <nav>
          <ul className="pagination justify-content-center mt-3 flex-wrap gap-1">
            {/* Prev */}
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link text-primary px-3"
                onClick={() => setPage(page - 1)}
              >
                <FaChevronLeft />{" "}
                <span className="d-none d-sm-inline">Prev</span>
              </button>
            </li>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link btn-primary text-dark px-3"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            {/* Next */}
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link text-primary px-3"
                onClick={() => setPage(page + 1)}
              >
                <span className="d-none d-sm-inline">Next</span>{" "}
                <FaChevronRight />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default CompaniesDirectory;
