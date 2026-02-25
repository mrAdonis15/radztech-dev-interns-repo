import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

function getBizDisplayName(biz) {
  return (
    biz?.name ??
    biz?.sBiz ??
    biz?.business?.name ??
    biz?.business?.businessName ??
    biz?.data?.name ??
    biz?.data?.businessName ??
    biz?.businessName ??
    biz?.companyName ??
    "Business"
  );
}

function getBizLogo(biz) {
  return (
    biz?.image ??
    biz?.business?.logo ??
    biz?.business?.logoUrl ??
    biz?.data?.logo ??
    biz?.data?.logoUrl ??
    biz?.logo ??
    biz?.logoUrl ??
    null
  );
}

export default function BizCard({ biz, onSelect, disabled }) {
  const name = getBizDisplayName(biz);
  const logo = getBizLogo(biz);

  return (
    <Card className="biz-ui-card" elevation={2}>
      <CardActionArea onClick={() => onSelect(biz)} disabled={disabled}>
        <CardContent>
          <Box display="flex" alignItems="center" flexDirection="column" py={1}>
            {logo && (
              <Box
                component="img"
                src={logo}
                alt=""
                className="biz-ui-card-logo"
                mb={1}
              />
            )}
            <Typography variant="h6" component="h2" align="center" color="textPrimary">
              {name}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
