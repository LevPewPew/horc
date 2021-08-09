#!/usr/bin/env node

const fs = require("fs");

const args = process.argv.slice(2);
const componentName = args[0];
const dir = `./${componentName}`;

const props = args.slice(1);

const camelPad = (str) => {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, " $1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/^./, (str) => {
      return str.toUpperCase();
    })
    .trim();
};

const insertComponentProps = () => {
  if (props.length > 0) {
    const snippet = props
      .reduce((prev, curr) => {
        return prev + curr + ", ";
      }, "")
      .slice(0, -2);

    return `{ ${snippet}, className }: ${componentName}.Props`;
  } else {
    return `{ className }: ${componentName}.Props`;
  }
};

const insertTypesProps = () => {
  if (props.length > 0) {
    const snippet = props.reduce((prev, curr) => {
      return prev + "\n    " + curr + ": /* TYPE */";
    }, "");

    return snippet;
  } else {
    return "";
  }
};

const insertStoriesArgTypesProps = () => {
  const fillArgTypeTemplate = (propName) => {
    return `  ${propName}: {
      name: "${camelPad(
        propName.slice(0, 1).toUpperCase() + propName.slice(1, propName.length)
      )}",
      description: /* DESCRIPTION */,
      control: /* CONTROL */,
      table: { type: { summary: /* TYPE */, detail: "${propName}" } },
    },`;
  };
  if (props.length > 0) {
    const snippet = props.reduce((prev, curr) => {
      return prev + "\n  " + fillArgTypeTemplate(curr);
    }, "");

    return snippet;
  } else {
    return "";
  }
};

const insertStoriesTemplateProps = () => {
  if (props.length > 0) {
    const snippet = props.reduce((prev, curr) => {
      return prev + "\n  " + curr + ": /* TYPE */,";
    }, "");

    return snippet;
  } else {
    return "";
  }
};

const indexBoilerplate = `import React from "react"
import { ${componentName} } from "./${componentName}"

export { ${componentName} }

`;

const componentBoilerplate = `import React from "react"
import { ExtendedStyles as E, Styles as S } from "./${componentName}.styles"

export const ${componentName} = (${insertComponentProps()}) => {
  return (
    <S.Wrapper className={className}>
      <>{/* COMPONENTS / ELEMENTS */}</>
    </S.Wrapper>
  )
}

`;

const typesBoilerplate = `namespace ${componentName} {
  export interface Props {${insertTypesProps()}
    className?: string
  }
}
`;

const stylesBoilerplate = `import styled from "styled-components"

export const Styles = {
  Wrapper: styled./* ELEMENT */\`\`
}

export const ExtendedStyles = {}
`;

const storiesBoilerplate = `// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from "@storybook/react/types-6-0"
import React from "react"
import styled from "styled-components"
import ${componentName} from "."

const Wrapper = styled.div\`
  align-items: center;
  display: flex;
  justify-content: center;
\`

export default {
  title: "Components/${componentName}",
  component: ${componentName},
  argTypes: {${insertStoriesArgTypesProps()}
  },
} as Meta

const Template: Story<${componentName}.Props> = (args) => (
  <Wrapper>
    <${componentName} {...args} />
  </Wrapper>
)

export const General = Template.bind({})
General.args = {${insertStoriesTemplateProps()}
}
`;

const testsBoilerplate = `import "@testing-library/jest-dom/extend-expect"
import React from "react"
import ${componentName} from "."
import { render, screen } from "../../../helpers/test-utils"

describe("${componentName}", () => {
  beforeEach(() => {
    render(
      <${componentName} /* PROPS, IF ANY */ />
    )
  })

  test(/* PASS CONDITION DESCRIPTION */, () => {
    const /* ELEMENT */ = screen./* QUERY */

    expect(/* SOMETHING */).toBe(/* SOMETHING */)
  })
})

`;

const createFileWithBoilerplate = (fileName, boilerplate) => {
  fs.appendFile(`${dir}/${fileName}`, boilerplate, function (err) {
    if (err) throw err;
    console.log(`Created ${fileName}`);
  });
};

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  createFileWithBoilerplate('index.tsx', indexBoilerplate);
  createFileWithBoilerplate(`${componentName}.tsx`, componentBoilerplate);
  createFileWithBoilerplate(`${componentName}.types.ts`, typesBoilerplate);
  createFileWithBoilerplate(`${componentName}.styles.ts`, stylesBoilerplate);
  createFileWithBoilerplate(`${componentName}.stories.tsx`, storiesBoilerplate);
  createFileWithBoilerplate(`${componentName}.test.tsx`, testsBoilerplate);
}
