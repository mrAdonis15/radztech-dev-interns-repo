import { Box, Typography } from "@material-ui/core";
import './Page.css';

function Evaluation() {
    return(
        <Box className="page-container">
            <Box className="page-header">
                <Typography variant="h4" className="page-title-main">Transactions</Typography>
                <Typography variant="h5" className="page-title-sub">Evaluation</Typography>
            </Box>
            <Box className="card-container">
                {/* Content goes here */}
            </Box>
        </Box>
    );
}
export default Evaluation;