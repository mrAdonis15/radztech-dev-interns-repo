import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

function getBizDisplayName(biz) {
  return biz?.sBiz || biz?.name || biz?.businessName || "Business";
}

function getBizAddress1(biz) {
  return biz?.Address1 || biz?.address1 || biz?.ad1 || "";
}

function getBizAddress2(biz) {
  return biz?.Address2 || biz?.address2 || biz?.ad2 || "";
}

export default function BizCard({ biz, onSelect, disabled }) {
  const name = getBizDisplayName(biz);
  const ad1 = getBizAddress1(biz);
  const ad2 = getBizAddress2(biz);

  return (
    <Card className="biz-ui-card" elevation={2}>
      <CardActionArea onClick={() => onSelect(biz)} disabled={disabled}>
        <CardContent>
          <Box display="flex" alignItems="center" flexDirection="column" py={1}>
            <Typography
              variant="h6"
              component="h2"
              align="center"
              color="textPrimary"
            >
              {name}
            </Typography>

            <Box mt={1}>
              {ad2 && (
                <Typography
                  variant="body2"
                  align="center"
                  color="textSecondary"
                >
                  {ad2}
                </Typography>
              )}

              {ad1 && (
                <Typography
                  variant="body2"
                  align="center"
                  color="textSecondary"
                >
                  {ad1}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
