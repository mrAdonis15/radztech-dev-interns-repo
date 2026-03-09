import { Box, Typography } from "@material-ui/core";
import './Page.css';

function ListofApplicants() {
    return(
        <Box className="page-container">
            <Box className="page-header">
                <Typography variant="h4" className="page-title-main">Reports</Typography>
                <Typography variant="h5" className="page-title-sub">List of Applicants</Typography>
            </Box>
            <Box className="card-container">
                {/* Content goes here */}
            </Box>
        </Box>
    );
}

export default ListofApplicants;