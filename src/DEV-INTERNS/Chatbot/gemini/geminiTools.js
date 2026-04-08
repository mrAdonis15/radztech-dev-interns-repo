export const tools = [
  {
    functionDeclarations: [
      {
        name: "search_prod",
        description:
          "Use this to search for specific products. Use ProdCd to display multiple entries. Use this only for searching products. If no products found, inform the user immediately.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The name or category of the product",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "search_branch",
        description:
          "Use this to search for specific branch. Only use this for finding/listing branches.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description:
                "The name/title of the branch. Set it to null if user wants all branches.",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "get_prod_bal",
        description:
          "Return the total product balance overall or for a single specified branch. Use this when the product balance query does not mention any branch or specifies only one branch.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The id of the product",
            },
            ixWH: {
              type: "integer",
              description: "Use 4282 as ixWH",
            },
            ixBrch: {
              type: "integer",
              description:
                "The branch where the product belongs. This is optional.",
            },
          },
          required: ["ixProd", "ixWH"],
        },
      },
      {
        name: "get_prod_bal_by_branch",
        description:
          "Return the product balance for each branch. Use this when the product balance query requests a breakdown by branch.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The id of the product",
            },
            ixWH: {
              type: "integer",
              description: "USE 4282 as ixWH",
            },
          },
          required: ["ixProd", "ixWH"],
        },
      },
      {
        name: "get_gl_report",
        description:
          "Returns the General Ledger (GL) report for selected GL account(s), including balances (beginning and ending), movements (debits and credits), and journal entries. Can be filtered by one or more branches.",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "The id of the gl account (ixAcc).",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            group_by_branch: {
              type: "boolean",
              description: "Group report by branch. Default false.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's start date.",
            },
            dt2: {
              type: "string",
              description:
                "End date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's end date.",
            },
            acc_others: {
              type: "array",
              items: {},
              description:
                "Optional list of other account filters. Default [].",
            },
          },
          required: ["ixAcc", "dt1", "dt2", "acc_others"],
        },
      },
      {
        name: "get_gl_graph",
        description:
          "Get and render a graph of general ledger Debit, Credit and running balance. Call this when the user wants to see a chart of GL account movement. Returns chart data for visualization.",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "The id of the GL account (ixAcc).",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (%Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to current month start.",
            },
            dt2: {
              type: "string",
              description:
                "End date (%Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to current month end.",
            },
            acc_others: {
              type: "array",
              items: {},
              description:
                "Optional list of other account filters. Default [].",
            },
            year: {
              type: "integer",
              description:
                "Optional year; used to default dt1/dt2 to that year.",
            },
          },
          required: ["ixAcc", "dt1", "dt2", "acc_others"],
        },
      },
      {
        name: "get_stockcard_report",
        description:
          "Get the stock card report (IN, OUT, running balance) for a product and date range. Use for tabular or summary responses.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The product id (ixProd).",
            },
            ixWH: {
              type: "integer",
              description:
                "The warehouse id (ixWH). Use 4282 if not specified.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (e.g. %Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to start of year.",
            },
            dt2: {
              type: "string",
              description:
                "End date (e.g. %Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to end of year.",
            },
            year: {
              type: "integer",
              description:
                "Optional year; used to default dt1/dt2 to that year.",
            },
          },
          required: ["ixProd"],
        },
      },
      {
        name: "get_stockcard_graph",
        description:
          "Get and render a graph of stock card IN, OUT and running balance. Call this when the user wants to see a chart of stock card movement. Returns chart data for visualization.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The product id (ixProd).",
            },
            ixWH: {
              type: "integer",
              description:
                "The warehouse id (ixWH). Use 4282 if not specified.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (e.g. %Y-%m-%d). Defaults to start of year.",
            },
            dt2: {
              type: "string",
              description: "End date (e.g. %Y-%m-%d). Defaults to end of year.",
            },
            year: {
              type: "integer",
              description:
                "Optional year; used to default dt1/dt2 to that year.",
            },
          },
          required: ["ixProd"],
        },
      },
      {
        name: "chart_renderer",
        description:
          "Return chart data for dynamic chart rendering. Use this if the data you received can be visualize to a graph.",
        parameters: {
          type: "object",
          properties: {
            chartType: {
              type: "string",
              description:
                "Choose the chart type based on the data: line (trends), pie/doughnut (proportions), bar (category comparison).",
            },
            data: {
              type: "object",
              description:
                "The chart data object must include labels (array of strings) and datasets (array of objects). Each dataset must have a label (string) and data (array of numbers), and may include distinct backgroundColor and borderColor. All color values must be unique across the entire chart, must not be reused, and should be generated as distinct HEX values using a consistent pattern to ensure uniqueness.",
            },
            options: {
              type: "object",
              description:
                "Chart.js options object for customizing the chart's appearance and behavior, including title, legend, scales, tooltips, responsiveness, and animations.",
            },
          },
          required: ["chartType", "data", "options"],
        },
      },
      {
        name: "get_prod_img",
        description: "Returns the images of a product.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The product id (ixProd).",
            },
          },
          required: ["ixProd"],
        },
      },
      {
        name: "search_sub_acc",
        description: "Use this to search specific sub account.",
        parameters: {
          type: "object",
          properties: {
            ixSubType: {
              type: "integer",
              description: "The subtype id of the account.",
            },
            q: {
              type: "string",
              description: "The title of the account",
            },
          },
          required: ["ixSubType", "q"],
        },
      },
      {
        name: "get_sl_report",
        description:
          "Returns the Subsidiary Ledger (SL) report for a specific sub-account(s) of a selected GL account, including balances (beginning and ending), movements (debits and credits), and journal entries. Can be filtered by one or more branches.",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "The id of the gl account (ixAcc).",
            },
            ixSub1: {
              type: "integer",
              description: "The id of the sub account (ixSub).",
            },
            ixSub2: {
              type: "integer",
              description: "Additional sub account. Default is 0.",
            },
            ixSub3: {
              type: "integer",
              description: "Additional sub account. Default is 0.",
            },
            ixSub4: {
              type: "integer",
              description: "Additional sub account. Default is 0.",
            },
            ixSub5: {
              type: "integer",
              description: "Additional sub account. Default is 0.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's start date.",
            },
            dt2: {
              type: "string",
              description:
                "End date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's end date.",
            },
            lst_branch: {
              type: "array",
              items: {},
              description:
                "Optional list of branch. Do not use this if user did not specify branch/branches.",
            },
            acc_others: {
              type: "array",
              items: {},
              description:
                "Optional list of ixAcc. Only include this if more than one ixAcc is needed for the request.",
            },
            showRep: {
              type: "boolean",
              description:
                "Boolean flag indicating whether individual transaction details are required. Defaults to false and should only be set to true when the userâ€™s query specifically requires transaction-level information.",
            },
          },
          required: [
            "ixAcc",
            "ixSub1",
            "ixSub2",
            "ixSub3",
            "ixSub4",
            "ixSub5",
            "dt1",
            "dt2",
            "lst_branch",
            "showRep",
          ],
        },
      },
      {
        name: "get_sl_bal",
        description:
          "Returns the Subsidiary Ledger (SL) balances summary for a specific GL account. Can also be used to get the SL summary for individual branches. For branch comparisons one, use the tool for all the branches one at a time.",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "The id of the gl account (ixAcc).",
            },
            dt1: {
              type: "string",
              description:
                "Start date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's start date.",
            },
            dt2: {
              type: "string",
              description:
                "End date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's end date.",
            },
            sDate: {
              type: "string",
              description:
                "The date range in text format (e.g. 'For the month ended Mar 31, 2026').",
            },
          },
          required: ["ixAcc", "dt1", "dt2", "sDate"],
        },
      },
    ],
  },
];
