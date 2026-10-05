
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

function AppHeader({ username, role, onLogout }) {
    return (
        <AppBar position="static" color="success">
            <Toolbar>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1
                    }}
                >
                    <AccountBalanceIcon sx={{ mr: 1 }} />

                    <Typography variant="h6" component="h1">
                        CashCow Command Center
                    </Typography>
                </Box>

                {username && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2
                        }}
                    >
                        <Typography variant="body2">
                            {username} ({role})
                        </Typography>

                        <Button color="inherit" onClick={onLogout}>
                            Log Out
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default AppHeader;
