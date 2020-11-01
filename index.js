#!/usr/bin/env node

const fs = require("fs");

const args = process.argv.slice(2);
const componentName = args[0];
const dir = `./${componentName}`;

const props = args.slice(1);

const insertIndexProps = () => {
  if (props.length > 0) {
    const snippet = props
      .reduce((prev, curr) => {
        return prev + curr + ", ";
      }, "")
      .slice(0, -2);

    return `{ ${snippet} }: ${componentName}Props`;
  } else {
    return "";
  }
};

const insertTypesProps = () => {
  if (props.length > 0) {
    const snippet = props.reduce((prev, curr) => {
      return prev + "\n  " + curr + ": /* TYPE */";
    }, "");

    return snippet;
  } else {
    return "";
  }
};

const insertStoriesArgTypesProps = () => {
  const fillArgTypeTemplate = (propName) => {
    return `  ${propName}: {
      name: "${
        propName.slice(0, 1).toUpperCase() + propName.slice(1, propName.length)
      }",
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
      return prev + "\n  " + curr + ": /* TYPE */";
    }, "");

    return snippet;
  } else {
    return "";
  }
};

const indexBoilerplate = `import React from "react"
import S from "./${componentName}.styles"

const ${componentName} = (${insertIndexProps()}) => {
  return (
    <S.Wrapper>
      <>{/* COMPONENTS / ELEMENTS */}</>
    </S.Wrapper>
  )
}

export default ${componentName}
`;

const typesBoilerplate = `interface ${componentName}Props {${insertTypesProps()}
}
`;

const stylesBoilerplate = `import styled from "styled-components"

export default {
  // element styles
  Wrapper: styled./* ELEMENT */\`\`,
  // extended styles
}
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

const Template: Story<${componentName}Props> = (args) => (
  <Wrapper>
    <${componentName} {...args} />
  </Wrapper>
)

export const General = Template.bind({})
General.args = {${insertStoriesTemplateProps()}
}
`;

const testsBoilerplate = `import { render, screen } from "@testing-library/react"
import React from "react"
import ${componentName} from "."

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

  createFileWithBoilerplate("index.tsx", indexBoilerplate);
  createFileWithBoilerplate(`${componentName}.d.ts`, typesBoilerplate);
  createFileWithBoilerplate(`${componentName}.styles.ts`, stylesBoilerplate);
  createFileWithBoilerplate(`${componentName}.stories.tsx`, storiesBoilerplate);
  createFileWithBoilerplate(`${componentName}.test.tsx`, testsBoilerplate);
}
