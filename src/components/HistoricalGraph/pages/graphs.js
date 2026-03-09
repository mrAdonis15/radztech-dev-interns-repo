import React from "react";
import { Container, Grid } from "@material-ui/core";
import CpuLoad from "../graphs/cpuload";
import CpuPercent from "../graphs/cpupercent";
import Task from "../graphs/task";
import PerCpu from "../graphs/percpu";

function Graph() {
    return (
        <Container 
            maxWidth="xl" 
            style={{ 
                paddingTop: "85px",
                boxSizing: "border-box",
                backgroundColor: "#f5f5f5",
                height: "100vh",
                width: "100vw",
            }}
        >
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={6}>
                    <CpuLoad height={300} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <CpuPercent height={300} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <PerCpu height={300} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <Task height={300} />
                </Grid>
            </Grid>
        </Container>
    );
}

export default Graph;