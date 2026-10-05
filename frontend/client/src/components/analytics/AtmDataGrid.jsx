import { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useAuth } from "../../context/AuthContext.jsx";

const API = "http://127.0.0.1:8000";

const statuses = [
    "OPERATIONAL",
    "IN_TRANSPORT",
    "MAINTENANCE",
    "OFFLINE"
];

const emptyAtm = {
    serial_number: "",
    model: "",
    status: "OPERATIONAL",
    cash_level: "",
    branch_id: "",
    technician_id: ""
};

export default function AtmDataGrid() {
    const { user } = useAuth();

    const isAdmin = user?.role === "operations_admin";

    const [atms, setAtms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Add
    const [addOpen, setAddOpen] = useState(false);
    const [newAtm, setNewAtm] = useState({ ...emptyAtm });

    // Edit
    const [editOpen, setEditOpen] = useState(false);
    const [editAtm, setEditAtm] = useState(null);

    // Delete
    const [deleteId, setDeleteId] = useState(null);

    const headers = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`
    });


    // =========================
    // GET ATMS
    // =========================

    async function fetchAtms() {
        setLoading(true);

        try {
            const res = await axios.get(
                `${API}/atm/`,
                {
                    headers: headers()
                }
            );

            setAtms(res.data);
            setError("");

        } catch {
            setError("Failed to load ATMs.");

        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchAtms();
    }, []);


    // =========================
    // ADD ATM
    // =========================

    function handleChange(e) {
        setNewAtm({
            ...newAtm,
            [e.target.name]: e.target.value
        });
    }


    async function handleAdd() {
        try {
            await axios.post(
                `${API}/atm/`,
                {
                    ...newAtm,

                    serial_number: Number(
                        newAtm.serial_number
                    ),

                    cash_level: Number(
                        newAtm.cash_level
                    ),

                    branch_id: Number(
                        newAtm.branch_id
                    ),

                    technician_id: Number(
                        newAtm.technician_id
                    )
                },
                {
                    headers: headers()
                }
            );

            setAddOpen(false);

            setNewAtm({
                ...emptyAtm
            });

            await fetchAtms();

        } catch (err) {
            setError(
                err.response?.data?.detail
                    ? JSON.stringify(
                        err.response.data.detail
                    )
                    : "Failed to add ATM."
            );
        }
    }


    // =========================
    // EDIT ATM
    // =========================

    function handleEditOpen(atm) {
        setEditAtm({
            ...atm
        });

        setEditOpen(true);
    }


    function handleEditChange(e) {
        setEditAtm({
            ...editAtm,
            [e.target.name]: e.target.value
        });
    }


    async function handleEdit() {
        try {
            await axios.patch(
                `${API}/atm/${editAtm.id}`,
                {
                    serial_number: Number(
                        editAtm.serial_number
                    ),

                    model: editAtm.model,

                    status: editAtm.status,

                    cash_level: Number(
                        editAtm.cash_level
                    ),

                    branch_id: Number(
                        editAtm.branch_id
                    ),

                    technician_id: Number(
                        editAtm.technician_id
                    )
                },
                {
                    headers: headers()
                }
            );

            setEditOpen(false);
            setEditAtm(null);

            await fetchAtms();

        } catch (err) {
            setError(
                err.response?.data?.detail
                    ? JSON.stringify(
                        err.response.data.detail
                    )
                    : "Failed to update ATM."
            );
        }
    }


    // =========================
    // DELETE ATM
    // =========================

    async function handleDelete() {
        try {
            await axios.delete(
                `${API}/atm/${deleteId}`,
                {
                    headers: headers()
                }
            );

            setDeleteId(null);

            await fetchAtms();

        } catch {
            setError("Failed to delete ATM.");
        }
    }


    // =========================
    // COLUMNS
    // =========================

    const columns = [
        {
            field: "id",
            headerName: "ID",
            width: 65
        },

        {
            field: "serial_number",
            headerName: "Serial Number",
            flex: 1,
            minWidth: 125
        },

        {
            field: "model",
            headerName: "Model",
            flex: 1,
            minWidth: 120
        },

        {
            field: "status",
            headerName: "Status",
            flex: 1,
            minWidth: 135
        },

        {
            field: "cash_level",
            headerName: "Cash (%)",
            width: 105,

            cellClassName: (params) =>
                Number(params.value) < 20
                    ? "low-cash-cell"
                    : ""
        },

        {
            field: "branch_id",
            headerName: "Branch ID",
            width: 105
        },

        {
            field: "technician_id",
            headerName: "Technician ID",
            width: 125
        }
    ];


    // Admin gets Edit + Delete
    if (isAdmin) {
        columns.push({
            field: "actions",
            headerName: "Actions",
            width: 175,
            sortable: false,
            filterable: false,

            renderCell: ({ row }) => (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        height: "100%"
                    }}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                            handleEditOpen(row)
                        }
                    >
                        Edit
                    </Button>

                    <Button
                        size="small"
                        color="error"
                        onClick={() =>
                            setDeleteId(row.id)
                        }
                    >
                        Delete
                    </Button>
                </Stack>
            )
        });
    }


    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0
            }}
        >

            {/* =========================
                HEADER
            ========================= */}

            <Box
                sx={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns:
                        "1fr auto",
                    alignItems: "center",
                    gap: 2,
                    mb: 2
                }}
            >

                <Typography
                    variant="h6"
                    sx={{
                        textAlign: "left"
                    }}
                >
                    ATM Management
                </Typography>


                {isAdmin && (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() =>
                            setAddOpen(true)
                        }
                    >
                        Add ATM
                    </Button>
                )}

            </Box>


            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>
            )}


            {/* =========================
                DATA GRID
            ========================= */}

            <DataGrid
                rows={atms}
                columns={columns}
                loading={loading}
                rowHeight={44}
                columnHeaderHeight={44}

                pageSizeOptions={[
                    5,
                    10,
                    25
                ]}

                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 5,
                            page: 0
                        }
                    }
                }}

                disableRowSelectionOnClick

                sx={{
                    width: "100%",
                    minHeight: 280,
                    borderRadius: 2,
                    fontSize: 13,

                    "& .low-cash-cell": {
                        backgroundColor:
                            "#ffcccc"
                    },

                    "& .low-cash-cell:hover": {
                        backgroundColor:
                            "#ffaaaa"
                    }
                }}
            />


            {/* =========================
                ADD ATM DIALOG
            ========================= */}

            <Dialog
                open={addOpen}
                onClose={() =>
                    setAddOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >

                <DialogTitle>
                    Add ATM
                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        sx={{
                            mt: 1
                        }}
                    >

                        {Object.keys(
                            emptyAtm
                        ).map((field) => (

                            <TextField
                                key={field}

                                select={
                                    field ===
                                    "status"
                                }

                                label={field
                                    .replaceAll(
                                        "_",
                                        " "
                                    )
                                    .toUpperCase()
                                }

                                name={field}

                                type={
                                    [
                                        "serial_number",
                                        "cash_level",
                                        "branch_id",
                                        "technician_id"
                                    ].includes(field)
                                        ? "number"
                                        : "text"
                                }

                                value={
                                    newAtm[field]
                                }

                                onChange={
                                    handleChange
                                }

                                size="small"
                                required
                                fullWidth
                            >

                                {field ===
                                    "status" &&

                                    statuses.map(
                                        (status) => (

                                            <MenuItem
                                                key={
                                                    status
                                                }
                                                value={
                                                    status
                                                }
                                            >
                                                {
                                                    status
                                                }
                                            </MenuItem>

                                        )
                                    )
                                }

                            </TextField>
                        ))}

                    </Stack>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() =>
                            setAddOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        color="success"
                        variant="contained"
                        onClick={handleAdd}
                    >
                        Add ATM
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =========================
                EDIT ATM DIALOG
            ========================= */}

            <Dialog
                open={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    setEditAtm(null);
                }}
                fullWidth
                maxWidth="xs"
            >

                <DialogTitle>
                    Edit ATM
                </DialogTitle>


                <DialogContent>

                    {editAtm && (

                        <Stack
                            spacing={2}
                            sx={{
                                mt: 1
                            }}
                        >

                            <TextField
                                label="SERIAL NUMBER"
                                name="serial_number"
                                type="number"
                                value={
                                    editAtm.serial_number
                                }
                                onChange={
                                    handleEditChange
                                }
                                size="small"
                                fullWidth
                            />


                            <TextField
                                label="MODEL"
                                name="model"
                                value={
                                    editAtm.model
                                }
                                onChange={
                                    handleEditChange
                                }
                                size="small"
                                fullWidth
                            />


                            <TextField
                                select
                                label="STATUS"
                                name="status"
                                value={
                                    editAtm.status
                                }
                                onChange={
                                    handleEditChange
                                }
                                size="small"
                                fullWidth
                            >

                                {statuses.map(
                                    (status) => (

                                        <MenuItem
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </MenuItem>

                                    )
                                )}

                            </TextField>


                            <TextField
                                label="CASH LEVEL"
                                name="cash_level"
                                type="number"
                                value={
                                    editAtm.cash_level
                                }
                                onChange={
                                    handleEditChange
                                }
                                size="small"
                                fullWidth
                            />


                            <TextField
                                label="BRANCH ID"
                                name="branch_id"
                                type="number"
                                value={
                                    editAtm.branch_id
                                }
                                onChange={
                                    handleEditChange
                                }
                                size="small"
                                fullWidth
                            />


                            <TextField
                                label="TECHNICIAN ID"
                                name="technician_id"
                                type="number"
                                value={
                                    editAtm.technician_id
                                }
                                onChange={
                                    handleEditChange
                                }
                                size="small"
                                fullWidth
                            />

                        </Stack>
                    )}

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() => {
                            setEditOpen(false);
                            setEditAtm(null);
                        }}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={handleEdit}
                    >
                        Save Changes
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =========================
                DELETE ATM DIALOG
            ========================= */}

            <Dialog
                open={
                    deleteId !== null
                }

                onClose={() =>
                    setDeleteId(null)
                }
            >

                <DialogTitle>
                    Delete ATM
                </DialogTitle>


                <DialogContent>
                    Are you sure you want
                    to delete ATM {deleteId}?
                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() =>
                            setDeleteId(null)
                        }
                    >
                        Cancel
                    </Button>


                    <Button
                        color="error"
                        variant="contained"
                        onClick={
                            handleDelete
                        }
                    >
                        Delete
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}